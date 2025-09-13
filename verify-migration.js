import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function verifyMigration() {
  console.log('🔍 Verifying database migration...');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Check new schema
    console.log('\n1. Testing new schema...');
    const { data: programs, error: schemaError } = await supabase
      .from('academic_programs')
      .select('id, program_title, main_image, short_description, full_description, subjects')
      .limit(1);
    
    if (schemaError) {
      console.log('❌ Schema test failed:', schemaError.message);
      if (schemaError.message.includes('column')) {
        console.log('   → Migration has not been run yet');
        return false;
      }
    } else {
      console.log('✅ New schema is working!');
      console.log('   Available columns: program_title, main_image, short_description, full_description, subjects');
    }
    
    // Test 2: Check data count
    console.log('\n2. Checking academic programs data...');
    const { data: allPrograms, error: countError } = await supabase
      .from('academic_programs')
      .select('id, program_title, display_order')
      .order('display_order');
    
    if (countError) {
      console.log('❌ Data check failed:', countError.message);
      return false;
    } else {
      console.log(`✅ Found ${allPrograms.length} academic programs`);
      allPrograms.forEach((program, index) => {
        console.log(`   ${index + 1}. ${program.program_title} (order: ${program.display_order})`);
      });
    }
    
    // Test 3: Check storage bucket and policies
    console.log('\n3. Testing storage bucket access...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Bucket access failed:', bucketError.message);
      return false;
    }
    
    const programIconsBucket = buckets.find(b => b.name === 'program-icons');
    if (!programIconsBucket) {
      console.log('❌ program-icons bucket not found');
      return false;
    }
    
    console.log('✅ program-icons bucket exists');
    console.log(`   Public: ${programIconsBucket.public}`);
    console.log(`   File size limit: ${(programIconsBucket.file_size_limit / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   Allowed types: ${programIconsBucket.allowed_mime_types.join(', ')}`);
    
    // Test 4: Test upload capability
    console.log('\n4. Testing upload capability...');
    
    // Create a minimal test image (1x1 pixel PNG)
    const testImageData = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const testFileName = `migration-test-${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('program-icons')
      .upload(testFileName, testImageData, {
        contentType: 'image/png',
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.log('❌ Upload test failed:', uploadError.message);
      if (uploadError.message.includes('policy')) {
        console.log('   → Storage policies may need to be updated');
      }
      return false;
    } else {
      console.log('✅ Upload test successful!');
      
      // Test public URL generation
      const { data: urlData } = supabase.storage
        .from('program-icons')
        .getPublicUrl(testFileName);
      
      console.log(`   Public URL: ${urlData.publicUrl}`);
      
      // Clean up test file
      await supabase.storage.from('program-icons').remove([testFileName]);
      console.log('   Test file cleaned up');
    }
    
    // Test 5: Test admin interface compatibility
    console.log('\n5. Testing admin interface compatibility...');
    
    // Try to insert a test record with the new schema
    const testProgram = {
      program_title: 'Migration Test Program',
      short_description: 'Test description',
      full_description: 'Full test description',
      subjects: ['Test Subject'],
      duration: 'Test Duration',
      main_image: null,
      icon_image: null,
      is_active: false,
      display_order: 999
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('academic_programs')
      .insert([testProgram])
      .select();
    
    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
      return false;
    } else {
      console.log('✅ Insert test successful!');
      
      // Clean up test record
      await supabase
        .from('academic_programs')
        .delete()
        .eq('id', insertData[0].id);
      console.log('   Test record cleaned up');
    }
    
    // Final summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 MIGRATION VERIFICATION SUCCESSFUL!');
    console.log('\n✅ All tests passed:');
    console.log('   • Database schema is correct');
    console.log('   • Academic programs data is present');
    console.log('   • Storage bucket is accessible');
    console.log('   • Upload functionality works');
    console.log('   • Admin interface compatibility confirmed');
    console.log('\n🚀 Your academic programs with image upload should now work correctly!');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ Verification failed with error:', error.message);
    return false;
  }
}

verifyMigration().then(success => {
  if (!success) {
    console.log('\n📋 Next steps:');
    console.log('1. Run the migration SQL in Supabase dashboard');
    console.log('2. Check the MIGRATION_INSTRUCTIONS.md file for detailed steps');
    console.log('3. Run this verification script again after migration');
    process.exit(1);
  }
});