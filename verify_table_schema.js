import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTableSchema() {
  try {
    console.log(`Connecting to Supabase at: ${supabaseUrl}`);
    
    // Try to query the kg_std_applications table
    const { data: testData, error: testError } = await supabase
      .from('kg_std_applications')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error querying kg_std_applications table:', testError);
      
      // If table doesn't exist, let's check what tables do exist
      console.log('\nChecking available tables...');
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_table_names');
      
      if (tablesError) {
        console.log('Could not list tables:', tablesError);
      } else {
        console.log('Available tables:', tables);
      }
      return;
    }
    
    console.log('✅ kg_std_applications table exists and is accessible');
    
    if (testData && testData.length > 0) {
      console.log('\nSample record structure:');
      const sampleRecord = testData[0];
      Object.keys(sampleRecord).forEach(key => {
        console.log(`- ${key}: ${typeof sampleRecord[key]} (${sampleRecord[key] !== null ? 'has data' : 'null'})`);
      });
      
      // Check specifically for child_name and full_name columns
      const hasChildName = 'child_name' in sampleRecord;
      const hasFullName = 'full_name' in sampleRecord;
      
      console.log(`\n✅ child_name column: ${hasChildName ? 'EXISTS' : 'MISSING'}`);
      console.log(`✅ full_name column: ${hasFullName ? 'EXISTS' : 'MISSING'}`);
      
      if (hasChildName && !hasFullName) {
        console.log('\n🔍 The table has child_name but not full_name. This matches our frontend updates.');
      } else if (hasFullName && !hasChildName) {
        console.log('\n🔍 The table has full_name but not child_name. Frontend expects child_name.');
      } else if (hasChildName && hasFullName) {
        console.log('\n🔍 The table has both child_name and full_name columns.');
      } else {
        console.log('\n❌ The table has neither child_name nor full_name columns.');
      }
    } else {
      console.log('\n📝 Table exists but has no data. Let\'s check the structure by trying to insert a test record...');
      
      // Try to get column info by attempting a minimal insert
      const { error: insertError } = await supabase
        .from('kg_std_applications')
        .insert({})
        .select();
      
      if (insertError) {
        console.log('Insert error (this helps us understand the required columns):');
        console.log(insertError.message);
      }
    }
    
  } catch (error) {
    console.error('Connection error:', error);
  }
}

verifyTableSchema();