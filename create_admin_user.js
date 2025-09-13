import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = 'https://lbpakffkctwafthhoayp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxicGFrZmZrY3R3YWZ0aGhvYXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY0NjQ4OSwiZXhwIjoyMDcwMjIyNDg5fQ.LV9vOhiXgo8b11L8olXheEgiwnu4-VN10tYEVSK2o3c';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🚀 Creating admin user...');
  
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

async function testAdminLogin() {
  console.log('\n🔐 Testing admin login...');
  
  const clientSupabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  
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

async function runAdminSetup() {
  await createAdminUser();
  await testAdminLogin();
  console.log('\n🏁 Admin setup completed!');
}

runAdminSetup().catch(console.error);