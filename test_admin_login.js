import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create client with anon key (same as frontend)
const supabase = createClient(supabaseUrl, anonKey);

async function testAdminLogin() {
  console.log('Testing admin login with credentials:');
  console.log('Email: web.modernhss@gmail.com');
  console.log('Password: Modern#2025');
  console.log('Supabase URL:', supabaseUrl);
  console.log('');
  
  try {
    // Test login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'web.modernhss@gmail.com',
      password: 'Modern#2025'
    });
    
    if (error) {
      console.error('Login failed with error:');
      console.error('- Code:', error.status);
      console.error('- Message:', error.message);
      console.error('- Full error:', JSON.stringify(error, null, 2));
      return;
    }
    
    console.log('Login successful!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Session token:', data.session?.access_token ? 'Present' : 'Missing');
    
    // Test getting user role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .single();
      
    if (roleError) {
      console.error('Error fetching user role:', roleError);
    } else {
      console.log('User role:', roleData.role);
    }
    
    // Test sign out
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('Sign out error:', signOutError);
    } else {
      console.log('Sign out successful');
    }
    
  } catch (err) {
    console.error('Unexpected error during login test:', err);
  }
}

testAdminLogin();