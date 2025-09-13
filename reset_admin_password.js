import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetAdminPassword() {
  console.log('Resetting admin password for: web.modernhss@gmail.com');
  
  try {
    // First, get the user ID
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }
    
    const adminUser = users.users.find(user => user.email === 'web.modernhss@gmail.com');
    
    if (!adminUser) {
      console.error('Admin user not found');
      return;
    }
    
    console.log('Found admin user with ID:', adminUser.id);
    
    // Update the user's password
    const { data, error } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      {
        password: 'Modern#2025',
        email_confirm: true
      }
    );
    
    if (error) {
      console.error('Error updating password:', error);
      return;
    }
    
    console.log('Password reset successful!');
    console.log('User can now login with:');
    console.log('- Email: web.modernhss@gmail.com');
    console.log('- Password: Modern#2025');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

resetAdminPassword();