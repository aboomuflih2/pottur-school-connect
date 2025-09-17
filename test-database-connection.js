import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('=== Database Connection Test ===');
console.log('Environment Variables:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Set' : 'Not Set');
console.log('');

// Test current configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please check your .env file has:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:');
      console.error('Error:', error.message);
      console.error('Code:', error.code);
      console.error('Details:', error.details);
      
      if (error.message.includes('Failed to fetch')) {
        console.error('');
        console.error('🔧 This usually means:');
        console.error('1. The Supabase URL is incorrect or unreachable');
        console.error('2. Network connectivity issues');
        console.error('3. CORS configuration problems');
        console.error('4. The Supabase service is down');
      }
      
      return false;
    }
    
    console.log('✅ Database connection successful!');
    console.log('Data:', data);
    return true;
    
  } catch (err) {
    console.error('❌ Connection test failed with exception:');
    console.error(err.message);
    return false;
  }
}

async function testAuth() {
  try {
    console.log('🔍 Testing authentication...');
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Auth test failed:', error.message);
      return false;
    }
    
    console.log('✅ Auth service accessible');
    console.log('Current session:', data.session ? 'Active' : 'None');
    return true;
    
  } catch (err) {
    console.error('❌ Auth test failed with exception:');
    console.error(err.message);
    return false;
  }
}

async function runTests() {
  console.log('Starting connection tests...\n');
  
  const connectionOk = await testConnection();
  console.log('');
  
  const authOk = await testAuth();
  console.log('');
  
  console.log('=== Test Results ===');
  console.log('Database Connection:', connectionOk ? '✅ PASS' : '❌ FAIL');
  console.log('Authentication:', authOk ? '✅ PASS' : '❌ FAIL');
  
  if (!connectionOk || !authOk) {
    console.log('');
    console.log('🔧 Troubleshooting Steps:');
    console.log('1. Check if Supabase URL is correct and accessible');
    console.log('2. Verify API keys are valid');
    console.log('3. Ensure network connectivity to Supabase');
    console.log('4. Check CORS settings in Supabase dashboard');
    console.log('5. Verify database tables exist and have proper permissions');
  }
}

runTests().catch(console.error)