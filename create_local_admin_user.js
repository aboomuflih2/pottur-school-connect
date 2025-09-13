import { createClient } from '@supabase/supabase-js';

// Local Supabase connection
const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createLocalAdminUser() {
  console.log('🚀 Creating local admin user...');
  
  try {
    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@potturschool.com',
      password: 'admin123',
      email_confirm: true
    });
    
    if (authError) {
      console.error('❌ Failed to create admin user:', authError.message);
      return;
    }
    
    console.log('✅ Admin user created successfully');
    console.log('User ID:', authData.user?.id);
    
    // Check if user role already exists
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', authData.user?.id)
      .single();
    
    if (roleCheckError && roleCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking existing role:', roleCheckError.message);
      return;
    }
    
    if (!existingRole) {
      // Create admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user?.id,
          role: 'admin'
        });
      
      if (roleError) {
        console.error('❌ Failed to create admin role:', roleError.message);
      } else {
        console.log('✅ Admin role created successfully');
      }
    } else {
      console.log('✅ Admin role already exists');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

async function testLocalAdminLogin() {
  console.log('\n🔐 Testing local admin login...');
  
  const clientSupabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data: authData, error: authError } = await clientSupabase.auth.signInWithPassword({
      email: 'admin@potturschool.com',
      password: 'admin123'
    });
    
    if (authError) {
      console.error('❌ Admin login failed:', authError.message);
      return;
    }
    
    console.log('✅ Admin login successful');
    console.log('User ID:', authData.user?.id);
    
    // Check user role
    const { data: roleData, error: roleError } = await clientSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authData.user?.id)
      .single();
    
    if (roleError) {
      console.error('❌ Failed to fetch user role:', roleError.message);
    } else {
      console.log('✅ User role:', roleData?.role);
    }
    
    // Sign out
    await clientSupabase.auth.signOut();
    
  } catch (err) {
    console.error('❌ Login test error:', err.message);
  }
}

async function runLocalAdminSetup() {
  await createLocalAdminUser();
  await testLocalAdminLogin();
  console.log('\n🏁 Local admin setup completed!');
  console.log('\n📋 Admin credentials:');
  console.log('Email: admin@potturschool.com');
  console.log('Password: admin123');
}

runLocalAdminSetup().catch(console.error);