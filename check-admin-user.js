import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const adminUserId = 'a809a250-d3cf-4617-ad00-ccc5683520d5';

async function checkAdminUser() {
  console.log('🔍 Checking admin user permissions...');
  console.log('Admin User ID:', adminUserId);
  
  try {
    // Check user_roles table
    console.log('\n👤 Checking user roles...');
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', adminUserId);
    
    if (rolesError) {
      console.error('❌ Error fetching user roles:', rolesError);
      return;
    }
    
    console.log('✅ User roles found:', userRoles?.length || 0);
    if (userRoles && userRoles.length > 0) {
      userRoles.forEach((role, index) => {
        console.log(`  ${index + 1}. Role: ${role.role}, Created: ${role.created_at}`);
      });
    } else {
      console.log('⚠️ No roles found for this user');
    }
    
    // Check auth.users table
    console.log('\n🔐 Checking auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
    } else {
      const targetUser = authUsers.users.find(user => user.id === adminUserId);
      if (targetUser) {
        console.log('✅ Auth user found:');
        console.log(`  Email: ${targetUser.email}`);
        console.log(`  Created: ${targetUser.created_at}`);
        console.log(`  Last Sign In: ${targetUser.last_sign_in_at}`);
        console.log(`  Email Confirmed: ${targetUser.email_confirmed_at ? 'Yes' : 'No'}`);
      } else {
        console.log('❌ Auth user not found');
      }
    }
    
    // Test RLS policies by trying to access school_stats as this user
    console.log('\n🛡️ Testing RLS policies...');
    
    // Create a client with the user's session (simulated)
    const userClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
    
    // Try to fetch school_stats with anon key (should work for read)
    const { data: anonStats, error: anonError } = await userClient
      .from('school_stats')
      .select('*');
    
    if (anonError) {
      console.error('❌ Anon access error:', anonError);
    } else {
      console.log('✅ Anon read access works, stats count:', anonStats?.length || 0);
    }
    
    // Try to insert with anon key (should fail)
    const { error: anonInsertError } = await userClient
      .from('school_stats')
      .insert({
        label: 'Test Insert',
        value: 1,
        suffix: '',
        icon_name: 'Trophy',
        display_order: 999,
        is_active: true
      });
    
    if (anonInsertError) {
      console.log('✅ Anon insert correctly blocked:', anonInsertError.message);
    } else {
      console.log('⚠️ Anon insert unexpectedly succeeded');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkAdminUser();