import { createClient } from '@supabase/supabase-js';

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing basic connection...');
    
    // Try a simple query to test connection
    const { data, error } = await supabase
      .from('academic_programs')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection error:', error);
    } else {
      console.log('✅ Connection successful!');
      console.log('Table count result:', data);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection()