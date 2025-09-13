import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function disableStorageRLS() {
  console.log('Disabling RLS on storage.objects table...');
  
  const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // Try to disable RLS using a direct SQL query
    const { data, error } = await serviceSupabase
      .from('pg_tables')
      .select('*')
      .eq('schemaname', 'storage')
      .eq('tablename', 'objects');
    
    if (error) {
      console.error('Error checking storage.objects table:', error.message);
      return;
    }
    
    console.log('Storage.objects table exists:', data.length > 0);
    
    // Since we can't execute arbitrary SQL, let's try a different approach
    // Let's check if we can grant permissions to anon role
    console.log('\nTrying alternative approach - checking current permissions...');
    
    // Test upload with anon key after attempting to work around RLS
    console.log('\nTesting anon upload again...');
    const anonSupabase = createClient(supabaseUrl, anonKey);
    
    const testSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="#EF4444"/>
      <text x="50" y="55" text-anchor="middle" fill="white" font-size="14">TEST</text>
    </svg>`;
    
    const fileName = `test-anon-retry-${Date.now()}.svg`;
    const { data: uploadData, error: uploadError } = await anonSupabase.storage
      .from('program-icons')
      .upload(`academic-programs/${fileName}`, testSvg, {
        contentType: 'image/svg+xml',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ Anon upload still failed:', uploadError.message);
      console.log('\nThe issue is that RLS is enabled on storage.objects but no policies exist for anon users.');
      console.log('For local development, we need to either:');
      console.log('1. Create proper RLS policies for storage.objects');
      console.log('2. Disable RLS on storage.objects (not recommended for production)');
      console.log('3. Use service role key for uploads in admin interface');
    } else {
      console.log('✅ Anon upload successful:', uploadData.path);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

disableStorageRLS().catch(console.error);