import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

async function addSampleStats() {
  console.log('📊 Adding sample school stats for testing admin interface...');
  
  try {
    // First, clear any existing stats
    console.log('🧹 Clearing existing stats...');
    const { error: clearError } = await adminSupabase
      .from('school_stats')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (clearError && clearError.code !== 'PGRST116') { // PGRST116 means no rows to delete
      console.error('❌ Error clearing stats:', clearError.message);
    } else {
      console.log('✅ Existing stats cleared');
    }
    
    // Add sample stats that showcase the school
    const sampleStats = [
      {
        label: 'Students Enrolled',
        value: 850,
        suffix: '+',
        icon_name: 'Users',
        display_order: 1,
        is_active: true
      },
      {
        label: 'Years of Excellence',
        value: 28,
        suffix: '+',
        icon_name: 'Award',
        display_order: 2,
        is_active: true
      },
      {
        label: 'Academic Success Rate',
        value: 98,
        suffix: '%',
        icon_name: 'BookOpen',
        display_order: 3,
        is_active: true
      },
      {
        label: 'State Awards Won',
        value: 15,
        suffix: '+',
        icon_name: 'Trophy',
        display_order: 4,
        is_active: true
      }
    ];
    
    console.log('\n📝 Adding sample stats...');
    
    for (const stat of sampleStats) {
      const { data, error } = await adminSupabase
        .from('school_stats')
        .insert(stat)
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Failed to add ${stat.label}:`, error.message);
      } else {
        console.log(`✅ Added: ${stat.label} - ${stat.value}${stat.suffix}`);
      }
    }
    
    console.log('\n🎉 Sample stats added successfully!');
    console.log('\n📋 You can now test the admin interface:');
    console.log('   1. Go to http://localhost:5173/admin/login');
    console.log('   2. Login with: web.modernhss@gmail.com / Modern#2025');
    console.log('   3. Navigate to School Stats Manager');
    console.log('   4. Test adding, editing, and deleting stats');
    console.log('   5. Check the homepage to see stats in Legacy section');
    
    console.log('\n🏠 Homepage Legacy section will display:');
    sampleStats.forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat.label}: ${stat.value}${stat.suffix}`);
    });
    
  } catch (error) {
    console.error('💥 Error adding sample stats:', error);
  }
}

addSampleStats();