import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  'http://127.0.0.1:54323',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function applyMigration() {
  try {
    console.log('Applying migration to fix academic_programs table...');
    
    // Execute each SQL statement individually
    const statements = [
      "ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS program_title TEXT;",
      "ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS short_description TEXT;",
      "ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS full_description TEXT;",
      "ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS main_image TEXT;",
      "ALTER TABLE academic_programs ADD COLUMN IF NOT EXISTS category TEXT;"
    ];
    
    for (const sql of statements) {
      console.log('Executing:', sql);
      try {
        // Use the REST API directly to execute SQL
        const response = await fetch('http://127.0.0.1:54323/rest/v1/rpc/exec_sql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
          },
          body: JSON.stringify({ sql })
        });
        
        if (response.ok) {
          console.log('✅ Success');
        } else {
          const error = await response.text();
          console.log('❌ Error:', error);
        }
      } catch (error) {
        console.log('❌ Error:', error.message);
      }
    }
    
    // Now copy data and set defaults
    const dataStatements = [
      "UPDATE academic_programs SET program_title = program_name WHERE program_name IS NOT NULL AND program_title IS NULL;",
      "UPDATE academic_programs SET short_description = 'Description not available' WHERE short_description IS NULL;",
      "UPDATE academic_programs SET full_description = 'Full description not available' WHERE full_description IS NULL;",
      "UPDATE academic_programs SET category = 'primary' WHERE category IS NULL;"
    ];
    
    for (const sql of dataStatements) {
      console.log('Executing:', sql);
      try {
        const response = await fetch('http://127.0.0.1:54323/rest/v1/rpc/exec_sql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
          },
          body: JSON.stringify({ sql })
        });
        
        if (response.ok) {
          console.log('✅ Success');
        } else {
          const error = await response.text();
          console.log('❌ Error:', error);
        }
      } catch (error) {
        console.log('❌ Error:', error.message);
      }
    }
    
    console.log('\n✅ Migration completed!');
    
  } catch (error) {
    console.error('Failed to apply migration:', error);
  }
}

applyMigration();