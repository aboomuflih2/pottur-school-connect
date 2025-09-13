import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54323';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAdminUser() {
  console.log('Checking for admin user: web.modernhss@gmail.com');
  
  try {
    // Use admin API to list users
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error listing users:', error);
      return;
    }
    
    console.log('Total users in database:', users.users.length);
    
    // Find admin user
    const adminUser = users.users.find(user => user.email === 'web.modernhss@gmail.com');
    
    if (adminUser) {
      console.log('Admin user found:');
      console.log('- ID:', adminUser.id);
      console.log('- Email:', adminUser.email);
      console.log('- Created:', adminUser.created_at);
      console.log('- Email confirmed:', adminUser.email_confirmed_at ? 'Yes' : 'No');
      
      // Check user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', adminUser.id);
        
      if (rolesError) {
        console.error('Error checking user roles:', rolesError);
      } else {
        console.log('User roles:', roles);
      }
    } else {
      console.log('Admin user NOT found in database');
      console.log('Available users:');
      users.users.forEach(user => {
        console.log(`- ${user.email} (${user.id})`);
      });
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkAdminUser();