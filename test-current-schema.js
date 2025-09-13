import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

// Create client with anon key (like frontend)
const supabase = createClient(supabaseUrl, anonKey);

async function testCurrentSchema() {
  try {
    console.log('Testing current schema and storage...');
    
    // 1. Test academic_programs table access
    console.log('\n1. Testing academic_programs table...');
    const { data: programs, error: programsError } = await supabase
      .from('academic_programs')
      .select('*')
      .limit(3);
    
    if (programsError) {
      console.error('Error accessing academic_programs:', programsError);
    } else {
      console.log(`Found ${programs.length} programs`);
      console.log('Current schema:', Object.keys(programs[0] || {}));
      if (programs.length > 0) {
        console.log('Sample program:', {
          id: programs[0].id,
          name: programs[0].program_name,
          description: programs[0].program_description?.substring(0, 50) + '...'
        });
      }
    }
    
    // 2. Test storage bucket access
    console.log('\n2. Testing storage bucket access...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
    } else {
      console.log('Available buckets:', buckets.map(b => b.name));
      
      // Check if program-icons bucket exists
      const programIconsBucket = buckets.find(b => b.name === 'program-icons');
      if (programIconsBucket) {
        console.log('✅ program-icons bucket exists');
        console.log('Bucket details:', programIconsBucket);
        
        // Test listing files in the bucket
        const { data: files, error: filesError } = await supabase.storage
          .from('program-icons')
          .list();
        
        if (filesError) {
          console.error('Error listing files in program-icons:', filesError);
        } else {
          console.log(`Found ${files.length} files in program-icons bucket`);
          if (files.length > 0) {
            console.log('Files:', files.map(f => f.name));
          }
        }
      } else {
        console.log('❌ program-icons bucket does not exist');
      }
    }
    
    // 3. Test image upload (create a small test file)
    console.log('\n3. Testing image upload...');
    
    // Create a simple test image data (1x1 pixel PNG)
    const testImageData = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const testFileName = `test-upload-${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('program-icons')
      .upload(testFileName, testImageData, {
        contentType: 'image/png',
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error('Upload test failed:', uploadError);
    } else {
      console.log('✅ Upload test successful!');
      console.log('Upload result:', uploadData);
      
      // Test getting public URL
      const { data: urlData } = supabase.storage
        .from('program-icons')
        .getPublicUrl(testFileName);
      
      console.log('Public URL:', urlData.publicUrl);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('program-icons')
        .remove([testFileName]);
      
      if (deleteError) {
        console.error('Error cleaning up test file:', deleteError);
      } else {
        console.log('✅ Test file cleaned up');
      }
    }
    
    // 4. Summary
    console.log('\n=== SUMMARY ===');
    console.log('Current Issues:');
    console.log('1. Database schema mismatch:');
    console.log('   - Current: program_name, program_description');
    console.log('   - Expected: program_title, main_image, short_description, full_description');
    console.log('\n2. To fix the image display issue:');
    console.log('   a) Run the migration SQL in Supabase dashboard');
    console.log('   b) Update the admin interface to use correct column names');
    console.log('   c) Re-populate data with correct structure');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCurrentSchema();