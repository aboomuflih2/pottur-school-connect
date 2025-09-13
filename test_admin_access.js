// Test script to check admin access and create admin user
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminAccess() {
  console.log('Testing admin access...');
  
  try {
    // 1. Check if user_roles table exists and has data
    console.log('\n1. Checking user_roles table...');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
    
    if (rolesError) {
      console.error('Error querying user_roles:', rolesError);
    } else {
      console.log('User roles found:', roles);
    }
    
    // 2. Check auth.users table
    console.log('\n2. Checking auth users...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Current session:', authData);
    
    // 3. Try to sign up a test admin user
    console.log('\n3. Creating test admin user...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@test.com',
      password: 'admin123456',
    });
    
    if (signUpError) {
      console.error('Error creating user:', signUpError);
    } else {
      console.log('User created:', signUpData);
      
      if (signUpData.user) {
        // 4. Add admin role to the user
        console.log('\n4. Adding admin role...');
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: signUpData.user.id,
            role: 'admin'
          });
        
        if (roleError) {
          console.error('Error adding admin role:', roleError);
        } else {
          console.log('Admin role added successfully:', roleData);
        }
      }
    }
    
    // 5. Check final state
    console.log('\n5. Final check of user_roles...');
    const { data: finalRoles, error: finalError } = await supabase
      .from('user_roles')
      .select('*');
    
    if (finalError) {
      console.error('Error in final check:', finalError);
    } else {
      console.log('Final user roles:', finalRoles);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testAdminAccess();