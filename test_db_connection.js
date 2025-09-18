// Test database connectivity
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing database connectivity...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n🔍 Testing Supabase connection...');
    
    // Try to get auth user (should return null if not authenticated)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError && authError.message !== 'Invalid JWT') {
      console.error('❌ Auth connection failed:', authError.message);
    } else {
      console.log('✅ Auth connection successful');
      console.log('Current user:', user ? user.email : 'Not authenticated');
    }
    
    // Test database connection by trying to query a system table
    console.log('\n🔍 Testing database query...');
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(5);
    
    if (error) {
      console.error('❌ Database query failed:', error.message);
    } else {
      console.log('✅ Database connection successful');
      console.log('Available tables:', data.map(t => t.tablename));
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();