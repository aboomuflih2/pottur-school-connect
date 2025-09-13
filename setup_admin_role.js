import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function setupAdminRole() {
  try {
    console.log('Setting up admin role...');
    
    // Find the admin user
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) {
      console.error('Error fetching users:', userError);
      return;
    }
    
    const adminUser = users.users.find(user => user.email === 'admin@test.com');
    if (!adminUser) {
      console.error('Admin user not found');
      return;
    }
    
    console.log('Found admin user:', adminUser.id);
    
    // Insert admin role using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: adminUser.id,
        role: 'admin'
      })
      .select();
    
    if (error) {
      console.error('Error adding admin role:', error);
    } else {
      console.log('Admin role added successfully:', data);
    }
    
    // Verify the role was added
    const { data: roles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', adminUser.id);
    
    if (roleError) {
      console.error('Error checking roles:', roleError);
    } else {
      console.log('User roles:', roles);
    }
    
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupAdminRole();