import { createClient } from '@supabase/supabase-js';

// Check both ports mentioned by user
const configs = [
  { url: 'http://127.0.0.1:54323', port: '54323' },
  { url: 'http://127.0.0.1:54325', port: '54325' }
];

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function checkDatabases() {
  for (const config of configs) {
    console.log(`\n=== Checking database on port ${config.port} ===`);
    
    const supabase = createClient(config.url, supabaseKey);
    
    try {
      // First check if we can connect
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5);
      
      if (tablesError) {
        console.log(`❌ Cannot connect to ${config.url}:`, tablesError.message);
        continue;
      }
      
      console.log(`✅ Connected to ${config.url}`);
      console.log('Available tables:', tables?.map(t => t.table_name) || []);
      
      // Check specifically for Kg_Std_Application
      const { data, error } = await supabase
        .from('Kg_Std_Application')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ Kg_Std_Application table error:', error.message);
      } else {
        console.log('✅ Kg_Std_Application table exists');
        if (data && data.length > 0) {
          console.log('Columns:', Object.keys(data[0]));
          console.log('Has full_name column:', Object.keys(data[0]).includes('full_name'));
        } else {
          console.log('Table is empty, checking column structure...');
        }
      }
      
    } catch (err) {
      console.log(`❌ Connection failed to ${config.url}:`, err.message);
    }
  }
}

checkDatabases();