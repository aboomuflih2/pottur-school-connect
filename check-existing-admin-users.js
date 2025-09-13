import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54323';
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create admin client with service role key for user management
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

// Create regular client for testing
const supabase = createClient(supabaseUrl, anonKey);

async function checkExistingAdminUsers() {
  console.log('🔍 Checking existing admin users in the system');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Check user_roles table for admin users
    console.log('\n1️⃣ Checking user_roles table for admin users...');
    
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'admin');
    
    if (rolesError) {
      console.error('❌ Error fetching admin roles:', rolesError);
    } else {
      console.log(`✅ Found ${adminRoles?.length || 0} admin role entries:`);
      adminRoles?.forEach(role => {
        console.log(`   - User ID: ${role.user_id}, Role: ${role.role}`);
      });
    }
    
    // Step 2: Check auth.users table using service role
    console.log('\n2️⃣ Checking auth.users table...');
    
    if (!serviceRoleKey) {
      console.log('❌ No service role key available - cannot check auth.users');
    } else {
      const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('❌ Error fetching auth users:', authError);
      } else {
        console.log(`✅ Found ${authUsers?.users?.length || 0} registered users:`);
        authUsers?.users?.forEach(user => {
          console.log(`   - Email: ${user.email}, ID: ${user.id}, Confirmed: ${!!user.email_confirmed_at}`);
        });
        
        // Cross-reference with admin roles
        if (adminRoles && adminRoles.length > 0) {
          console.log('\n🔗 Cross-referencing admin roles with auth users:');
          adminRoles.forEach(role => {
            const authUser = authUsers.users.find(u => u.id === role.user_id);
            if (authUser) {
              console.log(`   ✅ Admin user found: ${authUser.email} (${authUser.id})`);
            } else {
              console.log(`   ❌ Admin role exists but no auth user found for ID: ${role.user_id}`);
            }
          });
        }
      }
    }
    
    // Step 3: Try common admin credentials
    console.log('\n3️⃣ Testing common admin credentials...');
    
    const commonCredentials = [
      { email: 'admin@potturschool.com', password: 'admin123' },
      { email: 'web.modernhss@gmail.com', password: 'Modern#2025' },
      { email: 'admin@example.com', password: 'password' },
      { email: 'test@admin.com', password: 'test123' }
    ];
    
    for (const creds of commonCredentials) {
      console.log(`\nTesting: ${creds.email}`);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password
      });
      
      if (authError) {
        console.log(`   ❌ Failed: ${authError.message}`);
      } else {
        console.log(`   ✅ SUCCESS! Valid credentials found`);
        console.log(`   User ID: ${authData.user.id}`);
        console.log(`   Email: ${authData.user.email}`);
        
        // Check if this user has admin role
        const { data: roleCheck, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authData.user.id)
          .eq('role', 'admin')
          .single();
        
        if (roleError || !roleCheck) {
          console.log(`   ⚠️  User exists but no admin role assigned`);
        } else {
          console.log(`   🎉 ADMIN USER CONFIRMED!`);
        }
        
        // Sign out after testing
        await supabase.auth.signOut();
        break;
      }
    }
    
    // Step 4: Create admin user if none exists
    console.log('\n4️⃣ Creating admin user if needed...');
    
    if (serviceRoleKey) {
      const adminEmail = 'admin@potturschool.com';
      const adminPassword = 'admin123';
      
      console.log(`Attempting to create admin user: ${adminEmail}`);
      
      const { data: createData, error: createError } = await adminSupabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true
      });
      
      if (createError) {
        if (createError.message.includes('already registered')) {
          console.log(`   ℹ️  User ${adminEmail} already exists`);
        } else {
          console.error(`   ❌ Error creating user:`, createError);
        }
      } else {
        console.log(`   ✅ Admin user created successfully`);
        console.log(`   User ID: ${createData.user.id}`);
        
        // Add admin role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: createData.user.id,
            role: 'admin'
          });
        
        if (roleError) {
          console.error(`   ❌ Error adding admin role:`, roleError);
        } else {
          console.log(`   ✅ Admin role assigned successfully`);
          console.log(`   🎉 NEW ADMIN USER READY: ${adminEmail} / ${adminPassword}`);
        }
      }
    } else {
      console.log('❌ Cannot create admin user - no service role key');
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('Check the output above for valid admin credentials.');
    console.log('If no admin user exists, one should have been created.');
    
  } catch (error) {
    console.error('💥 Error checking admin users:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

checkExistingAdminUsers();