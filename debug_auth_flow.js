// Debug Authentication Flow
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase config from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lbpakffkctwafthhoayp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxicGFrZmZrY3R3YWZ0aGhvYXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NDY0ODksImV4cCI6MjA3MDIyMjQ4OX0.NQlbiQ6KdQZNKTwVfstOc8kBW71DfplZcSlAYEQ9tGk';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAdminRole(user) {
  if (!user) return false;
  
  console.log('\n3. Checking admin role for user:', user.id);
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single();
  
  if (roleError) {
    console.log('❌ Admin role check failed:', roleError.message);
    return false;
  } else {
    console.log('✅ Admin role found:', roleData);
    return true;
  }
}

async function debugAuthFlow() {
  console.log('🔍 Starting authentication flow debug...');
  
  try {
    // Test 1: Create a test admin user
    console.log('\n1. Creating test admin user...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'web.modernhss@gmail.com',
        password: 'admin123456'
      });
    
    let currentUser = null;
    
    if (signUpError) {
      console.log('❌ Sign up failed (user might exist):', signUpError.message);
      
      // Try to sign in with existing credentials
      console.log('\n2. Trying to sign in with existing admin credentials...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'web.modernhss@gmail.com',
          password: 'admin123456'
        });
      
      if (signInError) {
        console.log('❌ Sign in failed:', signInError.message);
        return;
      }
      
      console.log('✅ Sign in successful with existing user!');
      console.log('User ID:', signInData.user?.id);
      console.log('User Email:', signInData.user?.email);
      currentUser = signInData.user;
      
    } else {
      console.log('✅ Sign up successful!');
      console.log('User ID:', signUpData.user?.id);
      console.log('User Email:', signUpData.user?.email);
      currentUser = signUpData.user;
      
      if (signUpData.user) {
        // Add admin role to the new user
        console.log('\n2. Adding admin role to new user...');
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: signUpData.user.id,
            role: 'admin'
          });
        
        if (roleError) {
          console.log('❌ Failed to add admin role:', roleError.message);
        } else {
          console.log('✅ Admin role added successfully!');
        }
      }
    }
    
    // Test admin role check
    if (currentUser) {
      const isAdmin = await checkAdminRole(currentUser);
      
      // Test 4: Check all user roles for this user
      console.log('\n4. Checking all roles for this user...');
      const { data: allRoles, error: allRolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', currentUser.id);
      
      if (allRolesError) {
        console.log('❌ Failed to get user roles:', allRolesError.message);
      } else {
        console.log('✅ User roles:', allRoles);
      }
      
      // Test 5: Simulate the Auth.tsx flow
      console.log('\n5. Simulating Auth.tsx login flow...');
      if (isAdmin) {
        console.log('✅ User is admin - should redirect to /admin/dashboard');
      } else {
        console.log('❌ User is not admin - would redirect to /');
      }
    }
    
    // Test 6: Check user_roles table structure
    console.log('\n6. Checking user_roles table structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(5);
    
    if (tableError) {
      console.log('❌ Failed to query user_roles table:', tableError.message);
    } else {
      console.log('✅ User roles table data:', tableData);
    }
    
    // Test 7: Sign out
    console.log('\n7. Signing out...');
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.log('❌ Sign out failed:', signOutError.message);
    } else {
      console.log('✅ Sign out successful!');
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

// Run the debug
debugAuthFlow().then(() => {
  console.log('\n🏁 Debug completed!');
}).catch(error => {
  console.log('❌ Debug failed:', error);
});