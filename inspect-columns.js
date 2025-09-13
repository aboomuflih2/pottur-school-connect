import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectColumns() {
  console.log('🔍 Inspecting table columns...');
  
  const tables = [
    'kg_std_applications',
    'plus_one_applications', 
    'interview_subjects'
  ];
  
  for (const table of tables) {
    console.log(`\n📋 ${table}:`);
    
    try {
      // Try to insert with minimal data to see what columns are required/available
      const { data, error } = await supabase
        .from(table)
        .insert({})
        .select();
      
      if (error) {
        console.log(`   Error details: ${error.message}`);
        
        // Try to get existing data to see column structure
        const { data: existingData, error: selectError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!selectError && existingData && existingData.length > 0) {
          console.log(`   Available columns: ${Object.keys(existingData[0]).join(', ')}`);
        } else {
          console.log(`   No existing data to inspect columns`);
        }
      }
    } catch (err) {
      console.log(`   Exception: ${err.message}`);
    }
  }
  
  // Check admission_forms constraint
  console.log('\n📋 admission_forms constraint check:');
  try {
    const { data, error } = await supabase
      .from('admission_forms')
      .select('form_type');
    
    if (!error && data) {
      console.log(`   Existing form_types: ${data.map(d => d.form_type).join(', ')}`);
    }
  } catch (err) {
    console.log(`   Exception: ${err.message}`);
  }
}

inspectColumns().catch(console.error);