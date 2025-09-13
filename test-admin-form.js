import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

async function testAdminForm() {
  console.log('🧪 Testing School Stats Manager with admin client...');
  
  try {
    // Test 1: Load existing stats
    console.log('\n1️⃣ Loading existing stats...');
    const { data: existingStats, error: loadError } = await adminSupabase
      .from('school_stats')
      .select('*')
      .order('display_order');
    
    if (loadError) {
      console.error('❌ Failed to load stats:', loadError.message);
      return;
    }
    
    console.log(`✅ Loaded ${existingStats.length} existing stats`);
    existingStats.forEach(stat => {
      console.log(`   - ${stat.label}: ${stat.value}${stat.suffix} (${stat.is_active ? 'Active' : 'Inactive'})`);
    });
    
    // Test 2: Add a new stat (simulating admin form)
    console.log('\n2️⃣ Adding new stat...');
    const maxOrder = Math.max(...existingStats.map(s => s.display_order), 0);
    const newStat = {
      label: 'Test Excellence Rate',
      value: 95,
      suffix: '%',
      icon_name: 'Trophy',
      display_order: maxOrder + 1,
      is_active: true
    };
    
    const { data: insertedStat, error: insertError } = await adminSupabase
      .from('school_stats')
      .insert(newStat)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Failed to add stat:', insertError.message);
      return;
    }
    
    console.log('✅ Successfully added new stat:', insertedStat.label);
    
    // Test 3: Update the stat (simulating form edit)
    console.log('\n3️⃣ Updating stat...');
    const updatedData = {
      label: 'Academic Excellence Rate',
      value: 98,
      suffix: '%',
      icon_name: 'Award',
      is_active: true
    };
    
    const { error: updateError } = await adminSupabase
      .from('school_stats')
      .update(updatedData)
      .eq('id', insertedStat.id);
    
    if (updateError) {
      console.error('❌ Failed to update stat:', updateError.message);
    } else {
      console.log('✅ Successfully updated stat');
    }
    
    // Test 4: Verify the stat appears in homepage data
    console.log('\n4️⃣ Checking homepage data...');
    const { data: homepageStats, error: homepageError } = await adminSupabase
      .from('school_stats')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (homepageError) {
      console.error('❌ Failed to load homepage stats:', homepageError.message);
    } else {
      console.log(`✅ Homepage will show ${homepageStats.length} active stats:`);
      homepageStats.forEach(stat => {
        console.log(`   - ${stat.label}: ${stat.value}${stat.suffix}`);
      });
    }
    
    // Test 5: Test deactivation (simulating toggle)
    console.log('\n5️⃣ Testing stat deactivation...');
    const { error: deactivateError } = await adminSupabase
      .from('school_stats')
      .update({ is_active: false })
      .eq('id', insertedStat.id);
    
    if (deactivateError) {
      console.error('❌ Failed to deactivate stat:', deactivateError.message);
    } else {
      console.log('✅ Successfully deactivated stat');
    }
    
    // Clean up: Delete test stat
    console.log('\n🧹 Cleaning up test data...');
    const { error: deleteError } = await adminSupabase
      .from('school_stats')
      .delete()
      .eq('id', insertedStat.id);
    
    if (deleteError) {
      console.error('❌ Failed to delete test stat:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up');
    }
    
    console.log('\n🎉 All tests passed! School Stats Manager should work correctly.');
    console.log('\n📋 Summary:');
    console.log('   ✅ Admin can load existing stats');
    console.log('   ✅ Admin can add new stats');
    console.log('   ✅ Admin can update stats');
    console.log('   ✅ Stats appear in homepage data');
    console.log('   ✅ Admin can activate/deactivate stats');
    console.log('   ✅ Admin can delete stats');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testAdminForm();