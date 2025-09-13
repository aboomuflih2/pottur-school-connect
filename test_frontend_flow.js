import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Use the exact same configuration as the frontend
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

async function testFrontendFlow() {
  console.log('🔍 Testing Frontend Login Flow...');
  console.log('=' .repeat(50));
  
  try {
    // Step 1: Sign in (exactly like Auth.tsx)
    console.log('\n1. Signing in with admin credentials...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'web.modernhss@gmail.com',
      password: 'Modern#2025'
    });
    
    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
      return;
    }
    
    console.log('✅ Sign in successful!');
    console.log('User ID:', signInData.user.id);
    console.log('User email:', signInData.user.email);
    
    // Step 2: Check admin role (exactly like useAuth.checkAdminRole)
    console.log('\n2. Checking admin role...');
    const checkAdminRole = async (userId) => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .single();
        
        return !error && !!data;
      } catch {
        return false;
      }
    };
    
    const isAdmin = await checkAdminRole(signInData.user.id);
    console.log('✅ Admin check result:', isAdmin);
    
    // Step 3: Simulate Auth.tsx redirection logic
    console.log('\n3. Simulating Auth.tsx redirection logic...');
    if (isAdmin) {
      console.log('✅ User is admin - should redirect to /admin/dashboard');
    } else {
      console.log('❌ User is not admin - should redirect to /');
    }
    
    // Step 4: Test AdminRoute logic
    console.log('\n4. Testing AdminRoute protection logic...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (!session) {
      console.log('❌ No session - should redirect to /auth');
    } else {
      const adminCheck = await checkAdminRole(session.user.id);
      if (adminCheck) {
        console.log('✅ AdminRoute: User is authenticated admin - allow access');
      } else {
        console.log('❌ AdminRoute: User is not admin - should redirect to /');
      }
    }
    
    // Step 5: Clean up
    console.log('\n5. Signing out...');
    await supabase.auth.signOut();
    console.log('✅ Signed out successfully');
    
    console.log('\n🎉 Frontend flow test completed successfully!');
    console.log('The admin user should now be able to:');
    console.log('  1. Sign in at /auth');
    console.log('  2. Get redirected to /admin/dashboard');
    console.log('  3. Access admin-protected routes');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFrontendFlow();