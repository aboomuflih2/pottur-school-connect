import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAboutPageSave() {
  console.log('🔍 Testing About Page Save Functionality...');
  console.log('=' .repeat(50));

  try {
    // 1. Check if page_content table exists and its schema
    console.log('\n1. Checking page_content table schema...');
    const { data: pageContentSchema, error: pageContentError } = await supabase
      .from('page_content')
      .select('*')
      .limit(1);
    
    if (pageContentError) {
      console.error('❌ Error accessing page_content table:', pageContentError.message);
    } else {
      console.log('✅ page_content table accessible');
      console.log('Sample data structure:', pageContentSchema[0] || 'No data found');
    }

    // 2. Check if staff_counts table exists and its schema
    console.log('\n2. Checking staff_counts table schema...');
    const { data: staffCountsSchema, error: staffCountsError } = await supabase
      .from('staff_counts')
      .select('*')
      .limit(1);
    
    if (staffCountsError) {
      console.error('❌ Error accessing staff_counts table:', staffCountsError.message);
    } else {
      console.log('✅ staff_counts table accessible');
      console.log('Sample data structure:', staffCountsSchema[0] || 'No data found');
    }

    // 3. Check current page_content data
    console.log('\n3. Checking current page_content data...');
    const { data: currentContent, error: contentFetchError } = await supabase
      .from('page_content')
      .select('page_key, content')
      .in('page_key', ['about_legacy', 'about_mission', 'about_vision']);
    
    if (contentFetchError) {
      console.error('❌ Error fetching page content:', contentFetchError.message);
    } else {
      console.log('✅ Current page content:');
      currentContent.forEach(item => {
        console.log(`  - ${item.page_key}: ${item.content ? item.content.substring(0, 50) + '...' : 'No content'}`);
      });
    }

    // 4. Check current staff_counts data
    console.log('\n4. Checking current staff_counts data...');
    const { data: currentCounts, error: countsFetchError } = await supabase
      .from('staff_counts')
      .select('*')
      .single();
    
    if (countsFetchError) {
      console.error('❌ Error fetching staff counts:', countsFetchError.message);
    } else {
      console.log('✅ Current staff counts:', currentCounts);
    }

    // 5. Test page_content update (simulate AboutPage save logic)
    console.log('\n5. Testing page_content update...');
    const testContent = {
      about_legacy: 'Test legacy content - ' + new Date().toISOString(),
      about_mission: 'Test mission content - ' + new Date().toISOString(),
      about_vision: 'Test vision content - ' + new Date().toISOString()
    };

    const contentUpdates = Object.entries(testContent).map(([page_key, contentText]) => ({
      page_key,
      content: contentText,
    }));

    for (const update of contentUpdates) {
      const { error } = await supabase
        .from('page_content')
        .update({ content: update.content })
        .eq('page_key', update.page_key);

      if (error) {
        console.error(`❌ Error updating ${update.page_key}:`, error.message);
      } else {
        console.log(`✅ Successfully updated ${update.page_key}`);
      }
    }

    // 6. Test staff_counts update (identify the problematic logic)
    console.log('\n6. Testing staff_counts update...');
    
    // First, let's see what the current logic is trying to do
    console.log('Testing the problematic ID fetch logic...');
    const { data: idData, error: idError } = await supabase
      .from('staff_counts')
      .select('id')
      .single();
    
    if (idError) {
      console.error('❌ Error getting staff_counts ID:', idError.message);
      console.log('This is likely the source of the save issue!');
    } else {
      console.log('✅ Staff counts ID found:', idData.id);
      
      // Test the update with the found ID
      const testStaffCounts = {
        teaching_staff: 25,
        security_staff: 5,
        professional_staff: 15,
        guides_staff: 3
      };
      
      const { error: updateError } = await supabase
        .from('staff_counts')
        .update(testStaffCounts)
        .eq('id', idData.id);
      
      if (updateError) {
        console.error('❌ Error updating staff counts:', updateError.message);
      } else {
        console.log('✅ Successfully updated staff counts');
      }
    }

    // 7. Verify the updates
    console.log('\n7. Verifying updates...');
    const { data: verifyContent } = await supabase
      .from('page_content')
      .select('page_key, content')
      .in('page_key', ['about_legacy', 'about_mission', 'about_vision']);
    
    const { data: verifyCounts } = await supabase
      .from('staff_counts')
      .select('*')
      .single();
    
    console.log('Updated content verification:');
    verifyContent?.forEach(item => {
      console.log(`  - ${item.page_key}: ${item.content ? 'Updated ✅' : 'Not updated ❌'}`);
    });
    
    console.log('Updated counts verification:', verifyCounts);

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
  }
}

// Run the test
testAboutPageSave().then(() => {
  console.log('\n🏁 About page save test completed!');
}).catch(error => {
  console.error('💥 Test failed:', error);
});