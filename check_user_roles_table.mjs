import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Parse environment variables from .env file
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
  }
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Create admin client
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

try {
  console.log('🔍 Checking if user_roles table exists...');
  
  const { data, error } = await adminSupabase
    .from('user_roles')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('❌ user_roles table does not exist or is not accessible:');
    console.log('Error:', error);
    
    console.log('\n📝 This explains the frontend error. The admin client tries to check user roles.');
    console.log('💡 Solution: Remove the user role checking from admin client since this is a demo.');
  } else {
    console.log('✅ user_roles table exists and is accessible');
    console.log('Data:', data);
  }
  
} catch (error) {
  console.error('💥 Test failed:', error);
}