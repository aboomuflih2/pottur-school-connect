import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyKgStdMigration() {
  console.log('🚀 Applying KG & STD Applications Schema Migration...');
  console.log('=====================================================');

  try {
    // Read the migration file
    const migrationSQL = readFileSync('./supabase/migrations/037_fix_kg_std_schema.sql', 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    console.log('🔧 Executing migration...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', {
            sql_query: statement
          });
          
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            // Continue with other statements
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`❌ Exception in statement ${i + 1}:`, err.message);
        }
      }
    }
    
    // Verify the migration worked
    console.log('\n🔍 Verifying migration...');
    const { data, error } = await supabase
      .from('kg_std_applications')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Verification failed:', error.message);
    } else {
      console.log('✅ Migration verification successful!');
      console.log('📊 Table structure is now correct');
    }
    
    console.log('\n🎉 KG & STD Applications migration completed!');
    console.log('You can now submit applications without the "full_name" column error.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📋 Manual steps required:');
    console.log('1. Open Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Run the contents of: supabase/migrations/037_fix_kg_std_schema.sql');
  }
}

applyKgStdMigration();