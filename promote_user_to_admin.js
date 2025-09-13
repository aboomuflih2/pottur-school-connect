import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Use service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function promoteUserToAdmin() {
  const userId = 'a809a250-d3cf-4617-ad00-ccc5683520d5';
  
  console.log(`🔍 Promoting user ${userId} to admin role...`);
  
  // Check if user exists in auth.users
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
  
  if (authError) {
    console.log('❌ Error fetching user from auth:', authError.message);
    return;
  }
  
  if (!authUser.user) {
    console.log('❌ User not found in auth.users table');
    return;
  }
  
  console.log('✅ User found:', authUser.user.email);
  
  // Check if admin role already exists
  const { data: existingRole, error: checkError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single();
  
  if (checkError && checkError.code !== 'PGRST116') {
    console.log('❌ Error checking existing role:', checkError.message);
    return;
  }
  
  if (existingRole) {
    console.log('✅ Admin role already exists for this user');
    return;
  }
  
  // Add admin role
  const { data: newRole, error: insertError } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: 'admin'
    })
    .select()
    .single();
  
  if (insertError) {
    console.log('❌ Error adding admin role:', insertError.message);
    console.log('Full error:', insertError);
  } else {
    console.log('✅ Admin role added successfully:', newRole);
  }
  
  // Verify the role was added
  const { data: verifyRole, error: verifyError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single();
  
  if (verifyError) {
    console.log('❌ Error verifying role:', verifyError.message);
  } else {
    console.log('✅ Role verified:', verifyRole);
  }
  
  console.log('✅ Process completed!');
}

promoteUserToAdmin().catch(console.error);