// Test script to verify admin role assignment
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate the checkAdminRole function from useAuth hook
const checkAdminRole = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();
    
    return !error && !!data;
  } catch {
    return false;
  }
};

async function testAdminRole() {
  console.log('Testing admin role assignment...');
  
  const adminUserId = 'c323b782-1886-447d-be4e-13cefde8afc0';
  
  try {
    // 1. Check if the user exists in user_roles table
    console.log('\n1. Checking user_roles table for admin user...');
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', adminUserId);
    
    if (roleError) {
      console.error('Error querying user_roles:', roleError);
      return;
    }
    
    console.log('User role data:', userRole);
    
    // 2. Test the checkAdminRole function
    console.log('\n2. Testing checkAdminRole function...');
    const isAdmin = await checkAdminRole(adminUserId);
    console.log(`checkAdminRole result for ${adminUserId}:`, isAdmin);
    
    // 3. Test with a non-admin user (should return false)
    console.log('\n3. Testing checkAdminRole with non-existent user...');
    const isNonAdmin = await checkAdminRole('00000000-0000-0000-0000-000000000000');
    console.log('checkAdminRole result for non-existent user:', isNonAdmin);
    
    // 4. Verify the user exists in auth.users
    console.log('\n4. Verifying user exists in auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.log('Cannot access auth.users with anon key (expected)');
    } else {
      const adminUser = authUsers.users.find(u => u.id === adminUserId);
      console.log('Admin user found in auth.users:', !!adminUser);
    }
    
    console.log('\n=== Test Results ===');
    console.log(`✅ Admin role assigned: ${userRole && userRole.length > 0}`);
    console.log(`✅ checkAdminRole function works: ${isAdmin}`);
    console.log(`✅ Non-admin correctly returns false: ${!isNonAdmin}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAdminRole();