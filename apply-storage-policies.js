// Apply storage policies directly
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function applyStoragePolicies() {
  try {
    console.log('Applying storage policies...');
    
    const policies = [
      {
        name: 'Public read access for program-icons',
        sql: `
          CREATE POLICY "Public read access for program-icons" ON storage.objects
            FOR SELECT
            TO public
            USING (bucket_id = 'program-icons');
        `
      },
      {
        name: 'Authenticated users can upload to program-icons',
        sql: `
          CREATE POLICY "Authenticated users can upload to program-icons" ON storage.objects
            FOR INSERT
            TO authenticated
            WITH CHECK (bucket_id = 'program-icons');
        `
      },
      {
        name: 'Anonymous users can upload to program-icons',
        sql: `
          CREATE POLICY "Anonymous users can upload to program-icons" ON storage.objects
            FOR INSERT
            TO anon
            WITH CHECK (bucket_id = 'program-icons');
        `
      },
      {
        name: 'Authenticated users can update program-icons',
        sql: `
          CREATE POLICY "Authenticated users can update program-icons" ON storage.objects
            FOR UPDATE
            TO authenticated
            USING (bucket_id = 'program-icons')
            WITH CHECK (bucket_id = 'program-icons');
        `
      },
      {
        name: 'Anonymous users can update program-icons',
        sql: `
          CREATE POLICY "Anonymous users can update program-icons" ON storage.objects
            FOR UPDATE
            TO anon
            USING (bucket_id = 'program-icons')
            WITH CHECK (bucket_id = 'program-icons');
        `
      }
    ];
    
    for (const policy of policies) {
      console.log(`Applying policy: ${policy.name}`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: policy.sql
      });
      
      if (error) {
        console.error(`Error applying policy ${policy.name}:`, error);
        // Try alternative approach
        console.log('Trying direct query...');
        const { data: altData, error: altError } = await supabase
          .from('_realtime')
          .select('*')
          .limit(0); // This is just to test connection
        
        if (altError) {
          console.error('Connection test failed:', altError);
        }
      } else {
        console.log(`✓ Policy ${policy.name} applied successfully`);
      }
    }
    
    console.log('\nTesting upload after applying policies...');
    
    // Test upload again
    const testContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect width="100" height="100" fill="#10B981"/>
      <text x="50" y="55" text-anchor="middle" fill="white" font-size="10">Policy Test</text>
    </svg>`;
    
    const fileName = `policy-test-${Date.now()}.svg`;
    const filePath = `academic-programs/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('program-icons')
      .upload(filePath, testContent, {
        contentType: 'image/svg+xml'
      });
    
    if (uploadError) {
      console.error('Upload still failing:', uploadError);
    } else {
      console.log('✓ Upload successful after applying policies!');
      
      const { data: { publicUrl } } = supabase.storage
        .from('program-icons')
        .getPublicUrl(filePath);
      
      console.log('Public URL:', publicUrl);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

applyStoragePolicies();