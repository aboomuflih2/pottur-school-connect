import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testBucketAccess() {
  console.log('Testing bucket access...');
  
  // Test with service role key first
  console.log('\n1. Testing with service role key...');
  const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  const testSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="#4F46E5"/>
    <text x="50" y="55" text-anchor="middle" fill="white" font-size="14">SERVICE</text>
  </svg>`;
  
  const fileName = `test-service-${Date.now()}.svg`;
  const { data: serviceUploadData, error: serviceUploadError } = await serviceSupabase.storage
    .from('program-icons')
    .upload(`academic-programs/${fileName}`, testSvg, {
      contentType: 'image/svg+xml'
    });
  
  if (serviceUploadError) {
    console.error('❌ Service role upload failed:', serviceUploadError.message);
  } else {
    console.log('✅ Service role upload successful:', serviceUploadData.path);
  }
  
  // Test with anon key
  console.log('\n2. Testing with anon key...');
  const anonSupabase = createClient(supabaseUrl, anonKey);
  
  const anonTestSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="#10B981"/>
    <text x="50" y="55" text-anchor="middle" fill="white" font-size="14">ANON</text>
  </svg>`;
  
  const anonFileName = `test-anon-${Date.now()}.svg`;
  const { data: anonUploadData, error: anonUploadError } = await anonSupabase.storage
    .from('program-icons')
    .upload(`academic-programs/${anonFileName}`, anonTestSvg, {
      contentType: 'image/svg+xml'
    });
  
  if (anonUploadError) {
    console.error('❌ Anon upload failed:', anonUploadError.message);
  } else {
    console.log('✅ Anon upload successful:', anonUploadData.path);
    
    // Get public URL
    const { data: urlData } = anonSupabase.storage
      .from('program-icons')
      .getPublicUrl(anonUploadData.path);
    
    console.log('✅ Public URL generated:', urlData.publicUrl);
  }
  
  // Check bucket configuration
  console.log('\n3. Checking bucket configuration...');
  const { data: buckets, error: bucketsError } = await serviceSupabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Error listing buckets:', bucketsError.message);
  } else {
    const programIconsBucket = buckets.find(b => b.name === 'program-icons');
    if (programIconsBucket) {
      console.log('✅ program-icons bucket found:');
      console.log('   - Public:', programIconsBucket.public);
      console.log('   - File size limit:', programIconsBucket.file_size_limit);
      console.log('   - Allowed MIME types:', programIconsBucket.allowed_mime_types);
    } else {
      console.log('❌ program-icons bucket not found');
    }
  }
  
  // List existing files
  console.log('\n4. Listing existing files in academic-programs folder...');
  const { data: files, error: filesError } = await serviceSupabase.storage
    .from('program-icons')
    .list('academic-programs');
  
  if (filesError) {
    console.error('❌ Error listing files:', filesError.message);
  } else {
    console.log(`✅ Found ${files.length} files:`);
    files.forEach(file => {
      console.log(`   - ${file.name} (${file.metadata?.size || 'unknown size'})`);
    });
  }
}

testBucketAccess().catch(console.error);