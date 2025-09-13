import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkStorageBucket() {
  try {
    console.log('Checking storage buckets...');
    
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('Available buckets:', buckets.map(b => b.name));
    
    // Check if program-icons bucket exists
    const programIconsBucket = buckets.find(b => b.name === 'program-icons');
    
    if (programIconsBucket) {
      console.log('✅ program-icons bucket exists');
      console.log('Bucket details:', programIconsBucket);
      
      // Try to list files in the bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('program-icons')
        .list();
        
      if (filesError) {
        console.error('❌ Error accessing bucket files:', filesError);
      } else {
        console.log('✅ Bucket is accessible');
        console.log('Files in bucket:', files.length);
      }
      
      // Test upload a small file
      const testFile = new Blob(['test'], { type: 'text/plain' });
      const { error: uploadError } = await supabase.storage
        .from('program-icons')
        .upload('test-file.txt', testFile, {
          upsert: true
        });
        
      if (uploadError) {
        console.error('❌ Upload test failed:', uploadError);
      } else {
        console.log('✅ Upload test successful');
        
        // Clean up test file
        await supabase.storage
          .from('program-icons')
          .remove(['test-file.txt']);
      }
      
    } else {
      console.log('❌ program-icons bucket does not exist');
      
      // Create the bucket
      console.log('Creating program-icons bucket...');
      const { error: createError } = await supabase.storage.createBucket('program-icons', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('❌ Failed to create bucket:', createError);
      } else {
        console.log('✅ program-icons bucket created successfully');
      }
    }
    
  } catch (err) {
    console.error('Script error:', err);
  }
}

checkStorageBucket();