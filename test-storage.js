import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test public URL generation
const { data: { publicUrl } } = supabase.storage
  .from('program-icons')
  .getPublicUrl('academic-programs/test-upload.svg');

console.log('Generated public URL:', publicUrl);

// Test if we can list files
const { data: files, error } = await supabase.storage
  .from('program-icons')
  .list('academic-programs');

if (error) {
  console.error('Error listing files:', error);
} else {
  console.log('Files in academic-programs folder:', files);
}

// Test uploading a simple file
const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('program-icons')
  .upload('academic-programs/test-js-upload.txt', testFile);

if (uploadError) {
  console.error('Upload error:', uploadError);
} else {
  console.log('Upload successful:', uploadData);
}