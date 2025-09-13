import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking table schemas...');
  
  const tables = [
    'admission_forms',
    'kg_std_applications', 
    'plus_one_applications',
    'interview_subject_templates',
    'interview_subjects'
  ];
  
  for (const table of tables) {
    try {
      console.log(`\n📋 ${table}:`);
      
      // Get table schema using information_schema
      const { data: columns, error } = await supabase
        .rpc('exec', {
          sql: `
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = '${table}'
            ORDER BY ordinal_position;
          `
        });
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else if (columns && columns.length > 0) {
        columns.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'} ${col.column_default ? `default: ${col.column_default}` : ''}`);
        });
      } else {
        console.log(`   ❌ No columns found or table doesn't exist`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }
}

checkSchema().catch(console.error);