import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function addAdminRole() {
  console.log('🔍 Adding admin role for web.modernhss@gmail.com...');
  
  // First, sign in to get the user ID
  const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'web.modernhss@gmail.com',
    password: 'Modern#2025'
  });
  
  if (signInError) {
    console.log('❌ Error signing in:', signInError.message);
    return;
  }
  
  console.log('✅ User ID:', user.id);
  
  // Check if admin role already exists
  const { data: existingRole, error: checkError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single();
  
  if (checkError && checkError.code !== 'PGRST116') {
    console.log('❌ Error checking existing role:', checkError.message);
    return;
  }
  
  if (existingRole) {
    console.log('✅ Admin role already exists for this user');
    await supabase.auth.signOut();
    return;
  }
  
  // Add admin role
  const { data: newRole, error: insertError } = await supabase
    .from('user_roles')
    .insert({
      user_id: user.id,
      role: 'admin'
    })
    .select()
    .single();
  
  if (insertError) {
    console.log('❌ Error adding admin role:', insertError.message);
  } else {
    console.log('✅ Admin role added successfully:', newRole);
  }
  
  // Verify the role was added
  const { data: verifyRole, error: verifyError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single();
  
  if (verifyError) {
    console.log('❌ Error verifying role:', verifyError.message);
  } else {
    console.log('✅ Role verified:', verifyRole);
  }
  
  await supabase.auth.signOut();
  console.log('✅ Process completed!');
}

addAdminRole().catch(console.error);