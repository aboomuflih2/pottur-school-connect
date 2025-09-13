// Test the complete upload flow
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Initialize Supabase client
const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function testUploadFlow() {
  try {
    console.log('Testing complete upload flow...');
    
    // 1. Get the first academic program
    const { data: programs, error: fetchError } = await supabase
      .from('academic_programs')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.error('Error fetching programs:', fetchError);
      return;
    }
    
    if (!programs || programs.length === 0) {
      console.log('No programs found');
      return;
    }
    
    const program = programs[0];
    console.log('Testing with program:', program.program_title);
    
    // 2. Create a test file buffer (simulating file upload)
    const testImageContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#4F46E5"/>
      <text x="50" y="55" text-anchor="middle" fill="white" font-size="12">Test ${program.id}</text>
    </svg>`;
    
    // 3. Upload to storage
    const fileName = `${program.id}-${Date.now()}.svg`;
    const filePath = `academic-programs/${fileName}`;
    
    console.log('Uploading to path:', filePath);
    
    const { error: uploadError } = await supabase.storage
      .from('program-icons')
      .upload(filePath, testImageContent, {
        contentType: 'image/svg+xml'
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return;
    }
    
    console.log('Upload successful!');
    
    // 4. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('program-icons')
      .getPublicUrl(filePath);
    
    console.log('Generated public URL:', publicUrl);
    
    // 5. Update the database
    const { error: updateError } = await supabase
      .from('academic_programs')
      .update({ main_image: publicUrl })
      .eq('id', program.id);
    
    if (updateError) {
      console.error('Database update error:', updateError);
      return;
    }
    
    console.log('Database updated successfully!');
    
    // 6. Verify the update
    const { data: updatedProgram, error: verifyError } = await supabase
      .from('academic_programs')
      .select('id, program_title, main_image')
      .eq('id', program.id)
      .single();
    
    if (verifyError) {
      console.error('Verification error:', verifyError);
      return;
    }
    
    console.log('Verification result:', updatedProgram);
    
    // 7. Test if the URL is accessible
    console.log('\nTesting URL accessibility...');
    console.log('You can test this URL in browser:', publicUrl);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testUploadFlow();