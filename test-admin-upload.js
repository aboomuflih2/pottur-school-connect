// Test admin upload functionality
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

async function testAdminUpload() {
  try {
    console.log('Testing admin upload functionality...');
    
    // Create a simple test file (simulate image data)
    const testContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77mgAAAABJRU5ErkJggg==', 'base64');
    const testFileName = `test-${Date.now()}.png`;
    const filePath = `academic-programs/${testFileName}`;
    
    console.log(`Uploading test file: ${filePath}`);
    
    // Test upload with admin client
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('program-icons')
      .upload(filePath, testContent, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Upload failed:', uploadError);
      return;
    }
    
    console.log('Upload successful:', uploadData);
    
    // Test getting public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('program-icons')
      .getPublicUrl(filePath);
    
    console.log('Public URL:', publicUrl);
    
    // Test listing files in bucket
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('program-icons')
      .list('academic-programs', {
        limit: 10
      });
    
    if (listError) {
      console.error('List files failed:', listError);
    } else {
      console.log('Files in academic-programs folder:', files?.length || 0);
      files?.forEach(file => console.log(`  - ${file.name}`));
    }
    
    // Clean up test file
    const { error: deleteError } = await supabaseAdmin.storage
      .from('program-icons')
      .remove([filePath]);
    
    if (deleteError) {
      console.error('Delete failed:', deleteError);
    } else {
      console.log('Test file cleaned up successfully');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAdminUpload();