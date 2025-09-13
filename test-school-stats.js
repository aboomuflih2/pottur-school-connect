import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSchoolStats() {
  console.log('🔍 Testing School Stats functionality...');
  console.log('Supabase URL:', supabaseUrl);
  
  try {
    // Test 1: Check if table exists and get current data
    console.log('\n📊 Fetching existing school stats...');
    const { data: existingStats, error: fetchError } = await supabase
      .from('school_stats')
      .select('*')
      .order('display_order');
    
    if (fetchError) {
      console.error('❌ Error fetching stats:', fetchError);
      return;
    }
    
    console.log('✅ Current stats count:', existingStats?.length || 0);
    if (existingStats && existingStats.length > 0) {
      console.log('📋 Existing stats:');
      existingStats.forEach((stat, index) => {
        console.log(`  ${index + 1}. ${stat.label}: ${stat.value}${stat.suffix || ''} (${stat.is_active ? 'Active' : 'Inactive'})`);
      });
    }
    
    // Test 2: Try to insert a test stat
    console.log('\n➕ Testing insert functionality...');
    const testStat = {
      label: 'Test Stat',
      value: 100,
      suffix: '%',
      icon_name: 'Trophy',
      display_order: 999,
      is_active: true
    };
    
    const { data: insertedStat, error: insertError } = await supabase
      .from('school_stats')
      .insert(testStat)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error inserting test stat:', insertError);
      return;
    }
    
    console.log('✅ Test stat inserted successfully:', insertedStat.id);
    
    // Test 3: Try to update the test stat
    console.log('\n✏️ Testing update functionality...');
    const { error: updateError } = await supabase
      .from('school_stats')
      .update({ value: 150 })
      .eq('id', insertedStat.id);
    
    if (updateError) {
      console.error('❌ Error updating test stat:', updateError);
    } else {
      console.log('✅ Test stat updated successfully');
    }
    
    // Test 4: Clean up - delete the test stat
    console.log('\n🗑️ Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('school_stats')
      .delete()
      .eq('id', insertedStat.id);
    
    if (deleteError) {
      console.error('❌ Error deleting test stat:', deleteError);
    } else {
      console.log('✅ Test stat deleted successfully');
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testSchoolStats();