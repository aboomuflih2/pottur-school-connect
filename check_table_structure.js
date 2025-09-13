import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function checkTableStructure() {
  try {
    // Try to get table structure by attempting to insert with different fields
    const testFields = [
      'id',
      'program_title', 
      'short_description',
      'full_description',
      'main_image',
      'category',
      'is_active',
      'display_order',
      'created_at',
      'updated_at'
    ];
    
    console.log('Testing which fields exist in academic_programs table...');
    
    for (const field of testFields) {
      try {
        const testData = { [field]: field === 'is_active' ? true : (field === 'display_order' ? 0 : 'test') };
        const { error } = await supabase
          .from('academic_programs')
          .insert(testData)
          .select();
        
        if (error) {
          if (error.message.includes(`Could not find the '${field}' column`)) {
            console.log(`❌ ${field}: MISSING`);
          } else {
            console.log(`✅ ${field}: EXISTS (${error.message})`);
          }
        } else {
          console.log(`✅ ${field}: EXISTS`);
          // Clean up successful insert
          await supabase.from('academic_programs').delete().eq(field, testData[field]);
        }
      } catch (e) {
        console.log(`❓ ${field}: ERROR - ${e.message}`);
      }
    }
    
  } catch (error) {
    console.error('Failed to check table structure:', error);
  }
}

checkTableStructure();