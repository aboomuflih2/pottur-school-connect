import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// Use service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const migrationSQL = readFileSync('./supabase/migrations/016_fix_academic_programs_schema.sql', 'utf8');
    
    console.log('Applying migration to local Supabase...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.error(`Error in statement ${i + 1}:`, error);
            // Continue with other statements
          } else {
            console.log(`Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`Exception in statement ${i + 1}:`, err);
        }
      }
    }
    
    console.log('Migration application completed');
    
    // Test if the table was created successfully
    console.log('\nTesting table access...');
    const { data, error } = await supabase
      .from('academic_programs')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Table test failed:', error);
    } else {
      console.log('Table access successful!');
    }
    
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

applyMigration();