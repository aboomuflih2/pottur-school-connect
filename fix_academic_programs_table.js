import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function fixTableStructure() {
  try {
    console.log('Fixing academic_programs table structure...');
    
    // Add missing columns
    const alterQueries = [
      "ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS program_title VARCHAR(255);",
      "ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS short_description TEXT;",
      "ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS full_description TEXT;",
      "ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS main_image VARCHAR(500);",
      "ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS category VARCHAR(50);"
    ];
    
    for (const query of alterQueries) {
      console.log('Executing:', query);
      const { error } = await supabase.rpc('exec', { sql: query });
      if (error) {
        console.error('Error:', error.message);
      } else {
        console.log('✅ Success');
      }
    }
    
    // Copy data from program_name to program_title if program_name exists
    console.log('Copying data from program_name to program_title...');
    const { error: copyError } = await supabase.rpc('exec', { 
      sql: "UPDATE academic_programs SET program_title = program_name WHERE program_name IS NOT NULL AND program_title IS NULL;" 
    });
    
    if (copyError) {
      console.error('Copy error:', copyError.message);
    } else {
      console.log('✅ Data copied successfully');
    }
    
    // Set default values for required fields
    const defaultQueries = [
      "UPDATE academic_programs SET short_description = 'Description not available' WHERE short_description IS NULL;",
      "UPDATE academic_programs SET full_description = 'Full description not available' WHERE full_description IS NULL;",
      "UPDATE academic_programs SET category = 'primary' WHERE category IS NULL;"
    ];
    
    for (const query of defaultQueries) {
      console.log('Setting defaults:', query);
      const { error } = await supabase.rpc('exec', { sql: query });
      if (error) {
        console.error('Error:', error.message);
      } else {
        console.log('✅ Defaults set');
      }
    }
    
    console.log('\n✅ Table structure fixed successfully!');
    
  } catch (error) {
    console.error('Failed to fix table structure:', error);
  }
}

fixTableStructure();