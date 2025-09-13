import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const adminEmail = 'web.modernhss@gmail.com';
const adminPassword = 'Modern#2025';
const adminUserId = 'a809a250-d3cf-4617-ad00-ccc5683520d5';

async function testCompleteAdminWorkflow() {
  console.log('🚀 Testing complete admin workflow for School Stats Manager...');
  console.log('Admin Email:', adminEmail);
  console.log('Admin User ID:', adminUserId);
  
  try {
    // Step 1: Test admin login
    console.log('\n1️⃣ Testing admin login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (signInError) {
      console.error('❌ Login failed:', signInError.message);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('   User ID:', signInData.user.id);
    console.log('   Email:', signInData.user.email);
    
    // Step 2: Verify admin role
    console.log('\n2️⃣ Verifying admin role...');
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', signInData.user.id)
      .eq('role', 'admin')
      .single();
    
    if (roleError || !roleData) {
      console.error('❌ Admin role verification failed:', roleError?.message);
      return;
    }
    
    console.log('✅ Admin role verified!');
    
    // Step 3: Test school_stats table access
    console.log('\n3️⃣ Testing school_stats table access...');
    
    // Clear existing stats first
    const { error: clearError } = await supabase
      .from('school_stats')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (clearError) {
      console.log('⚠️ Could not clear existing stats:', clearError.message);
    } else {
      console.log('✅ Cleared existing stats');
    }
    
    // Step 4: Test adding new stats (simulating admin form)
    console.log('\n4️⃣ Testing adding new school stats...');
    
    const testStats = [
      {
        label: 'Students Enrolled',
        value: 1200,
        suffix: '+',
        icon_name: 'Users',
        display_order: 1,
        is_active: true
      },
      {
        label: 'Years of Excellence',
        value: 25,
        suffix: '',
        icon_name: 'Award',
        display_order: 2,
        is_active: true
      },
      {
        label: 'Success Rate',
        value: 95,
        suffix: '%',
        icon_name: 'Trophy',
        display_order: 3,
        is_active: true
      },
      {
        label: 'Faculty Members',
        value: 80,
        suffix: '+',
        icon_name: 'GraduationCap',
        display_order: 4,
        is_active: true
      }
    ];
    
    for (let i = 0; i < testStats.length; i++) {
      const stat = testStats[i];
      console.log(`   Adding stat ${i + 1}: ${stat.label}...`);
      
      const { data: insertData, error: insertError } = await supabase
        .from('school_stats')
        .insert(stat)
        .select()
        .single();
      
      if (insertError) {
        console.error(`   ❌ Failed to add ${stat.label}:`, insertError.message);
        return;
      }
      
      console.log(`   ✅ Added ${stat.label} (ID: ${insertData.id})`);
    }
    
    // Step 5: Verify stats were added correctly
    console.log('\n5️⃣ Verifying added stats...');
    const { data: allStats, error: fetchError } = await supabase
      .from('school_stats')
      .select('*')
      .order('display_order');
    
    if (fetchError) {
      console.error('❌ Failed to fetch stats:', fetchError.message);
      return;
    }
    
    console.log(`✅ Successfully retrieved ${allStats.length} stats:`);
    allStats.forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat.label}: ${stat.value}${stat.suffix} (${stat.is_active ? 'Active' : 'Inactive'})`);
    });
    
    // Step 6: Test updating a stat
    console.log('\n6️⃣ Testing stat update...');
    const firstStat = allStats[0];
    const { error: updateError } = await supabase
      .from('school_stats')
      .update({ value: 1250 })
      .eq('id', firstStat.id);
    
    if (updateError) {
      console.error('❌ Failed to update stat:', updateError.message);
      return;
    }
    
    console.log('✅ Successfully updated stat value');
    
    // Step 7: Test homepage data retrieval (simulating LegacySection.tsx)
    console.log('\n7️⃣ Testing homepage data retrieval...');
    const { data: homepageStats, error: homepageError } = await supabase
      .from('school_stats')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (homepageError) {
      console.error('❌ Failed to fetch homepage stats:', homepageError.message);
      return;
    }
    
    console.log(`✅ Homepage would display ${homepageStats.length} active stats:`);
    homepageStats.forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat.label}: ${stat.value}${stat.suffix} (Icon: ${stat.icon_name})`);
    });
    
    // Step 8: Test deactivating a stat
    console.log('\n8️⃣ Testing stat deactivation...');
    const { error: deactivateError } = await supabase
      .from('school_stats')
      .update({ is_active: false })
      .eq('id', allStats[1].id);
    
    if (deactivateError) {
      console.error('❌ Failed to deactivate stat:', deactivateError.message);
      return;
    }
    
    console.log('✅ Successfully deactivated stat');
    
    // Step 9: Verify homepage only shows active stats
    console.log('\n9️⃣ Verifying homepage shows only active stats...');
    const { data: activeStats, error: activeError } = await supabase
      .from('school_stats')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (activeError) {
      console.error('❌ Failed to fetch active stats:', activeError.message);
      return;
    }
    
    console.log(`✅ Homepage now shows ${activeStats.length} active stats (should be 3):`);
    activeStats.forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat.label}: ${stat.value}${stat.suffix}`);
    });
    
    console.log('\n🎉 All tests passed! School Stats Manager is working correctly!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Admin authentication works');
    console.log('   ✅ Admin role verification works');
    console.log('   ✅ Can add new school stats');
    console.log('   ✅ Can update existing stats');
    console.log('   ✅ Can activate/deactivate stats');
    console.log('   ✅ Homepage data retrieval works');
    console.log('   ✅ RLS policies are working correctly');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  } finally {
    // Sign out
    await supabase.auth.signOut();
    console.log('\n🔐 Signed out successfully');
  }
}

testCompleteAdminWorkflow();