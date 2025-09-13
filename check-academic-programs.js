const { createClient } = require('@supabase/supabase-js');

// Use the service role key to check data
const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function checkAcademicPrograms() {
  try {
    console.log('Checking academic_programs table...');
    
    const { data, error } = await supabase
      .from('academic_programs')
      .select('id, program_title, main_image, icon_image')
      .order('display_order');
    
    if (error) {
      console.error('Error fetching academic programs:', error);
      return;
    }
    
    console.log(`Found ${data.length} academic programs:`);
    data.forEach((program, index) => {
      console.log(`${index + 1}. ${program.program_title}`);
      console.log(`   ID: ${program.id}`);
      console.log(`   Main Image: ${program.main_image || 'No main image'}`);
      console.log(`   Icon Image: ${program.icon_image || 'No icon image'}`);
      console.log('');
    });
    
  } catch (err) {
    console.error('Script error:', err);
  }
}

checkAcademicPrograms();