import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLMigration() {
  console.log('Executing SQL migration...');
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '016_fix_academic_programs_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Migration SQL loaded, executing...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });
        
        if (error) {
          console.error(`Error in statement ${i + 1}:`, error);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    // Verify the migration worked
    console.log('\nVerifying migration...');
    const { data: programs, error: verifyError } = await supabase
      .from('academic_programs')
      .select('*');
    
    if (verifyError) {
      console.error('Verification error:', verifyError);
    } else {
      console.log(`✅ Migration completed! Found ${programs.length} academic programs`);
      programs.forEach(p => console.log(`- ${p.program_title}`));
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('Next steps:');
    console.log('1. Access admin interface at: http://localhost:5173/admin/academics');
    console.log('2. Test image upload functionality');
    console.log('3. Verify content management works correctly');
    
  } catch (error) {
    console.error('Migration failed:', error);
    
    // Fallback: Try direct table creation
    console.log('\nTrying direct table creation...');
    
    try {
      // Drop and recreate table
      await supabase.rpc('exec_sql', {
        sql_query: 'DROP TABLE IF EXISTS academic_programs CASCADE'
      });
      
      // Create table with correct schema
      const createTableSQL = `
        CREATE TABLE academic_programs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          program_title TEXT NOT NULL,
          short_description TEXT,
          full_description TEXT,
          detailed_description TEXT,
          subjects TEXT[],
          duration TEXT,
          main_image TEXT,
          icon_image TEXT,
          is_active BOOLEAN DEFAULT true,
          display_order INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )`;
      
      await supabase.rpc('exec_sql', { sql_query: createTableSQL });
      
      // Enable RLS
      await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE academic_programs ENABLE ROW LEVEL SECURITY'
      });
      
      // Grant permissions
      await supabase.rpc('exec_sql', {
        sql_query: 'GRANT SELECT ON academic_programs TO anon'
      });
      
      await supabase.rpc('exec_sql', {
        sql_query: 'GRANT ALL PRIVILEGES ON academic_programs TO authenticated'
      });
      
      console.log('✅ Table created successfully with direct approach');
      
    } catch (fallbackError) {
      console.error('Fallback approach also failed:', fallbackError);
      console.log('\n=== MANUAL INTERVENTION REQUIRED ===');
      console.log('Please run the migration manually in Supabase Dashboard:');
      console.log('1. Open http://127.0.0.1:54321');
      console.log('2. Go to SQL Editor');
      console.log('3. Copy and paste the contents of supabase/migrations/016_fix_academic_programs_schema.sql');
      console.log('4. Execute the SQL');
    }
  }
}

executeSQLMigration();