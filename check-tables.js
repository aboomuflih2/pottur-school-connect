import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking database tables...');
  
  const tables = [
    'admission_forms',
    'kg_std_applications', 
    'plus_one_applications',
    'interview_subject_templates',
    'interview_subjects'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Table exists, ${data ? data.length : 0} sample records`);
        if (data && data.length > 0) {
          console.log(`   Sample columns: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

checkTables().catch(console.error);