// Check academic_programs table schema
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkTableSchema() {
  try {
    console.log('Checking academic_programs table schema...');
    
    // Try to get table info using a simple query
    const { data, error } = await supabaseAdmin
      .from('academic_programs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying table:', error);
      return;
    }
    
    console.log('Table exists and is accessible.');
    
    // Try inserting a minimal record to see what columns are required
    const testRecord = {
      program_title: 'Test Program',
      short_description: 'Test description'
    };
    
    console.log('Testing minimal insert...');
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('academic_programs')
      .insert(testRecord)
      .select();
    
    if (insertError) {
      console.error('Insert error (this helps us understand the schema):', insertError);
    } else {
      console.log('Insert successful:', insertData);
      
      // Clean up test record
      await supabaseAdmin
        .from('academic_programs')
        .delete()
        .eq('program_title', 'Test Program');
      
      console.log('Test record cleaned up.');
    }
    
  } catch (error) {
    console.error('Failed to check table schema:', error);
  }
}

checkTableSchema();