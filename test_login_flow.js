import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function testLoginFlow() {
  console.log('🔍 Testing complete login flow...');
  
  try {
    // Step 1: Sign in with correct admin credentials
    console.log('\n1. Signing in with admin credentials...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'web.modernhss@gmail.com',
      password: 'Modern#2025'
    });
    
    if (signInError) {
      console.log('❌ Failed to sign in:', signInError.message);
      return;
    }
    
    console.log('✅ Successfully signed in:', signInData.user.email);
    const user = signInData.user;
    
    // Step 2: Check admin role immediately (like Auth.tsx does)
    console.log('\n2. Checking admin role immediately (Auth.tsx simulation)...');
    const { data: adminRoleData, error: adminRoleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    if (adminRoleError) {
      console.log('❌ Admin role check failed:', adminRoleError.message);
      console.log('Error details:', adminRoleError);
    } else {
      console.log('✅ Admin role confirmed:', adminRoleData);
    }
    
    // Step 3: Wait a bit and check again (like AdminRoute might do)
    console.log('\n3. Waiting 100ms and checking admin role again (AdminRoute simulation)...');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { data: adminRoleData2, error: adminRoleError2 } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    if (adminRoleError2) {
      console.log('❌ Second admin role check failed:', adminRoleError2.message);
    } else {
      console.log('✅ Second admin role check confirmed:', adminRoleData2);
    }
    
    // Step 4: Test rapid successive checks
    console.log('\n4. Testing rapid successive admin role checks...');
    for (let i = 0; i < 3; i++) {
      const { data: rapidCheck, error: rapidError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      if (rapidError) {
        console.log(`❌ Rapid check ${i + 1} failed:`, rapidError.message);
      } else {
        console.log(`✅ Rapid check ${i + 1} passed:`, rapidCheck);
      }
    }
    
    // Step 5: Check current session
    console.log('\n5. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session check failed:', sessionError.message);
    } else if (session) {
      console.log('✅ Session active for user:', session.user.email);
    } else {
      console.log('❌ No active session found');
    }
    
    // Step 6: Test the exact checkAdminRole function logic
    console.log('\n6. Testing exact checkAdminRole function logic...');
    const checkAdminRole = async (userId) => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .single();
        
        if (error) {
          console.log('checkAdminRole error:', error.message);
          return false;
        }
        
        return data?.role === 'admin';
      } catch (err) {
        console.log('checkAdminRole exception:', err.message);
        return false;
      }
    };
    
    const isAdmin = await checkAdminRole(user.id);
    console.log('✅ checkAdminRole result:', isAdmin);
    
    // Step 7: Sign out
    console.log('\n7. Signing out...');
    await supabase.auth.signOut();
    console.log('✅ Signed out successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n🏁 Login flow test completed!');
}

testLoginFlow();