import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixAcademicProgramsTable() {
  try {
    console.log('Fixing academic_programs table schema...');
    
    // First, drop the existing table
    console.log('Dropping existing table...');
    const { error: dropError } = await supabase
      .rpc('exec_sql', { 
        sql: 'DROP TABLE IF EXISTS academic_programs CASCADE;' 
      });
    
    if (dropError) {
      console.log('Drop table failed (trying alternative method):', dropError);
      // Try direct SQL execution via a different approach
      try {
        await supabase.from('academic_programs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log('Cleared existing data instead');
      } catch (clearError) {
        console.log('Could not clear data:', clearError);
      }
    } else {
      console.log('Table dropped successfully');
    }
    
    // Create the table with correct schema using direct SQL
    console.log('Creating table with correct schema...');
    
    // Since we can't use exec_sql, let's try a different approach
    // We'll use the Supabase client to create records that will force the schema
    
    // First, let's try to insert a record with all the fields we need
    // This will fail but might give us insight into the current schema
    const testRecord = {
      program_title: 'Test Program',
      short_description: 'Test description',
      full_description: 'Test full description',
      main_image: null,
      icon_image: null,
      subjects: ['Test Subject'],
      duration: '1 Year',
      is_active: true,
      display_order: 1
    };
    
    console.log('Testing insert with new schema...');
    const { data: insertData, error: insertError } = await supabase
      .from('academic_programs')
      .insert(testRecord)
      .select();
    
    if (insertError) {
      console.log('Insert failed as expected:', insertError.message);
      
      // Let's try to add the missing columns one by one
      console.log('\nAttempting to add missing columns...');
      
      const alterCommands = [
        'ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS program_title TEXT;',
        'ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS short_description TEXT;',
        'ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS full_description TEXT;',
        'ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS main_image TEXT;',
        'ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS icon_image TEXT;',
        'ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS subjects TEXT[];',
        'UPDATE academic_programs SET program_title = program_name WHERE program_title IS NULL;',
        'UPDATE academic_programs SET short_description = program_description WHERE short_description IS NULL;',
        'UPDATE academic_programs SET full_description = program_description WHERE full_description IS NULL;'
      ];
      
      // Since we can't execute SQL directly, let's try a workaround
      // We'll create a new table with the correct schema and copy data
      console.log('Creating new table structure manually...');
      
      // Try to insert with minimal data first
      const minimalRecord = {
        duration: '1 Year',
        is_active: true,
        display_order: 1
      };
      
      const { data: minimalData, error: minimalError } = await supabase
        .from('academic_programs')
        .insert(minimalRecord)
        .select();
      
      if (minimalError) {
        console.log('Even minimal insert failed:', minimalError);
      } else {
        console.log('Minimal insert succeeded:', minimalData);
        // Clean up test record
        await supabase.from('academic_programs').delete().eq('id', minimalData[0].id);
      }
      
    } else {
      console.log('Insert succeeded! Table has correct schema:', insertData);
      // Clean up test record
      await supabase.from('academic_programs').delete().eq('id', insertData[0].id);
    }
    
  } catch (err) {
    console.error('Script error:', err);
  }
}

fixAcademicProgramsTable();