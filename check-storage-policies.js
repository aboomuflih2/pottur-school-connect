// Check storage policies and bucket configuration
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function checkStoragePolicies() {
  try {
    console.log('Checking storage bucket configuration...');
    
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('Available buckets:', buckets.map(b => ({ name: b.name, public: b.public })));
    
    const programIconsBucket = buckets.find(b => b.name === 'program-icons');
    if (!programIconsBucket) {
      console.log('program-icons bucket not found!');
      return;
    }
    
    console.log('program-icons bucket config:', programIconsBucket);
    
    // Check storage policies using raw SQL
    const { data: policies, error: policiesError } = await supabase
      .rpc('sql', {
        query: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE schemaname = 'storage' 
          AND tablename = 'objects'
          ORDER BY policyname;
        `
      });
    
    if (policiesError) {
      console.error('Error checking policies:', policiesError);
      
      // Try alternative approach
      console.log('\nTrying alternative query...');
      const { data: altData, error: altError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('schemaname', 'storage')
        .eq('tablename', 'objects');
      
      if (altError) {
        console.error('Alternative query also failed:', altError);
      } else {
        console.log('Storage policies:', altData);
      }
    } else {
      console.log('Storage policies:', policies);
    }
    
    // Check bucket-specific policies
    console.log('\nChecking bucket-specific access...');
    
    // Try to list files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from('program-icons')
      .list('academic-programs');
    
    if (listError) {
      console.error('Error listing files:', listError);
    } else {
      console.log('Files in academic-programs folder:', files);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkStoragePolicies();