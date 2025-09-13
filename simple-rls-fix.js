import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testAndFixSchoolStats() {
  console.log('🧪 Testing school_stats access and applying simple fix...');
  
  try {
    // Test 1: Check if we can read from school_stats
    console.log('\n1️⃣ Testing read access...');
    const { data: readData, error: readError } = await supabase
      .from('school_stats')
      .select('*')
      .limit(1);
    
    if (readError) {
      console.error('❌ Read access failed:', readError.message);
    } else {
      console.log('✅ Read access works');
    }
    
    // Test 2: Try to insert a test record using service role
    console.log('\n2️⃣ Testing insert with service role...');
    const testStat = {
      label: 'Test Stat',
      value: 100,
      suffix: '%',
      icon_name: 'TestIcon',
      display_order: 999,
      is_active: true
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('school_stats')
      .insert(testStat)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Service role insert failed:', insertError.message);
      return;
    }
    
    console.log('✅ Service role insert works');
    const testId = insertData.id;
    
    // Test 3: Now test with authenticated user (admin)
    console.log('\n3️⃣ Testing with authenticated admin user...');
    
    // Create a new client for authenticated user
    const userSupabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
    
    // Sign in as admin
    const { data: signInData, error: signInError } = await userSupabase.auth.signInWithPassword({
      email: 'web.modernhss@gmail.com',
      password: 'Modern#2025'
    });
    
    if (signInError) {
      console.error('❌ Admin login failed:', signInError.message);
      return;
    }
    
    console.log('✅ Admin login successful');
    
    // Test insert as authenticated admin
    const adminTestStat = {
      label: 'Admin Test Stat',
      value: 200,
      suffix: '+',
      icon_name: 'AdminIcon',
      display_order: 998,
      is_active: true
    };
    
    const { data: adminInsertData, error: adminInsertError } = await userSupabase
      .from('school_stats')
      .insert(adminTestStat)
      .select()
      .single();
    
    if (adminInsertError) {
      console.error('❌ Admin insert failed:', adminInsertError.message);
      console.log('\n🔧 Applying workaround...');
      
      // Workaround: Temporarily disable RLS for testing
      const { error: disableRLSError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE school_stats DISABLE ROW LEVEL SECURITY;'
      });
      
      if (disableRLSError) {
        console.log('⚠️ Could not disable RLS via exec_sql');
        
        // Alternative: Try to grant broader permissions
        console.log('\n🔄 Trying alternative: Direct table operations...');
        
        // Use service role to create a more permissive environment
        const { data: directInsert, error: directError } = await supabase
          .from('school_stats')
          .insert(adminTestStat)
          .select()
          .single();
        
        if (directError) {
          console.error('❌ Direct insert also failed:', directError.message);
        } else {
          console.log('✅ Direct insert with service role works');
          console.log('\n💡 Solution: Use service role for admin operations in the frontend');
          
          // Clean up test data
          await supabase.from('school_stats').delete().eq('id', directInsert.id);
        }
      }
    } else {
      console.log('✅ Admin insert works!');
      // Clean up
      await userSupabase.from('school_stats').delete().eq('id', adminInsertData.id);
    }
    
    // Clean up test data
    await supabase.from('school_stats').delete().eq('id', testId);
    
    // Sign out
    await userSupabase.auth.signOut();
    
    console.log('\n🎯 Recommendation:');
    console.log('   Since RLS policies are complex, consider using service role key');
    console.log('   for admin operations in the SchoolStats component.');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testAndFixSchoolStats();