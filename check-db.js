import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Check what's in the academic_programs table
const { data: programs, error } = await supabase
  .from('academic_programs')
  .select('id, program_title, main_image')
  .order('display_order');

if (error) {
  console.error('Error fetching programs:', error);
} else {
  console.log('Academic programs in database:');
  programs.forEach(program => {
    console.log(`- ${program.program_title}`);
    console.log(`  ID: ${program.id}`);
    console.log(`  Image: ${program.main_image || 'No image'}`);
    console.log('');
  });
}

// Test if we can update a program with an image URL
if (programs && programs.length > 0) {
  const firstProgram = programs[0];
  const testImageUrl = 'http://127.0.0.1:54321/storage/v1/object/public/program-icons/academic-programs/c0ff3fee-f9c1-4c30-828d-580e34002c73-1757410930313.jpg';
  
  console.log(`Testing update of program: ${firstProgram.program_title}`);
  
  const { data: updateData, error: updateError } = await supabase
    .from('academic_programs')
    .update({ main_image: testImageUrl })
    .eq('id', firstProgram.id)
    .select();
  
  if (updateError) {
    console.error('Error updating program:', updateError);
  } else {
    console.log('Update successful:', updateData);
  }
}