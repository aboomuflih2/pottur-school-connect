import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54323';
// Standard local Supabase service role key
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

if (!supabaseUrl) {
  console.error('Missing Supabase URL');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStoragePolicies() {
  console.log('Setting up storage policies for program-icons bucket...');
  
  try {
    // Drop existing policies if they exist
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Public read access for program-icons" ON storage.objects;',
      'DROP POLICY IF EXISTS "Authenticated users can upload to program-icons" ON storage.objects;',
      'DROP POLICY IF EXISTS "Anonymous users can upload to program-icons" ON storage.objects;',
      'DROP POLICY IF EXISTS "Authenticated users can update program-icons" ON storage.objects;',
      'DROP POLICY IF EXISTS "Anonymous users can update program-icons" ON storage.objects;',
      'DROP POLICY IF EXISTS "Authenticated users can delete from program-icons" ON storage.objects;',
      'DROP POLICY IF EXISTS "Anonymous users can delete from program-icons" ON storage.objects;'
    ];
    
    for (const policy of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.log(`Note: ${error.message}`);
      }
    }
    
    // Create new policies
    const createPolicies = [
      // Public read access
      `CREATE POLICY "Public read access for program-icons" ON storage.objects
        FOR SELECT
        TO public
        USING (bucket_id = 'program-icons');`,
      
      // Authenticated users policies
      `CREATE POLICY "Authenticated users can upload to program-icons" ON storage.objects
        FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'program-icons');`,
      
      `CREATE POLICY "Authenticated users can update program-icons" ON storage.objects
        FOR UPDATE
        TO authenticated
        USING (bucket_id = 'program-icons')
        WITH CHECK (bucket_id = 'program-icons');`,
      
      `CREATE POLICY "Authenticated users can delete from program-icons" ON storage.objects
        FOR DELETE
        TO authenticated
        USING (bucket_id = 'program-icons');`,
      
      // Anonymous users policies (for testing)
      `CREATE POLICY "Anonymous users can upload to program-icons" ON storage.objects
        FOR INSERT
        TO anon
        WITH CHECK (bucket_id = 'program-icons');`,
      
      `CREATE POLICY "Anonymous users can update program-icons" ON storage.objects
        FOR UPDATE
        TO anon
        USING (bucket_id = 'program-icons')
        WITH CHECK (bucket_id = 'program-icons');`,
      
      `CREATE POLICY "Anonymous users can delete from program-icons" ON storage.objects
        FOR DELETE
        TO anon
        USING (bucket_id = 'program-icons');`
    ];
    
    for (const policy of createPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.error(`Error creating policy: ${error.message}`);
      } else {
        console.log('✓ Policy created successfully');
      }
    }
    
    console.log('\nStorage policies setup completed!');
    
    // Test upload with anon key
    console.log('\nTesting upload with anon key...');
    const anonSupabase = createClient(supabaseUrl, anonKey);
    
    const testSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="#4F46E5"/>
      <text x="50" y="55" text-anchor="middle" fill="white" font-size="14">TEST</text>
    </svg>`;
    
    const fileName = `test-${Date.now()}.svg`;
    const { data: uploadData, error: uploadError } = await anonSupabase.storage
      .from('program-icons')
      .upload(`academic-programs/${fileName}`, testSvg, {
        contentType: 'image/svg+xml'
      });
    
    if (uploadError) {
      console.error('Upload test failed:', uploadError.message);
    } else {
      console.log('✓ Upload test successful:', uploadData.path);
      
      // Get public URL
      const { data: urlData } = anonSupabase.storage
        .from('program-icons')
        .getPublicUrl(uploadData.path);
      
      console.log('✓ Public URL generated:', urlData.publicUrl);
    }
    
  } catch (error) {
    console.error('Error setting up storage policies:', error.message);
  }
}

setupStoragePolicies();