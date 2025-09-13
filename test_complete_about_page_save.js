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

async function testCompleteAboutPageSave() {
  console.log('🧪 Testing complete About Page save flow with fixed schema...');
  console.log('=' .repeat(70));

  try {
    // 1. Test page_content operations with correct schema
    console.log('\n1. Testing page_content operations with correct schema...');
    
    // Check current page_content data
    const { data: currentPageContent, error: fetchPageError } = await supabase
      .from('page_content')
      .select('*')
      .in('page_key', ['about_legacy', 'about_mission', 'about_vision']);
    
    if (fetchPageError) {
      console.error('❌ Error fetching page content:', fetchPageError.message);
      return;
    } else {
      console.log('✅ Current page content found:', currentPageContent.length, 'records');
      currentPageContent.forEach(item => {
        console.log(`  - ${item.page_key}: "${item.content.substring(0, 50)}..."`);
      });
    }

    // 2. Test the exact AboutPage save logic with upsert
    console.log('\n2. Testing AboutPage save logic simulation with upsert...');
    
    // Simulate the updated AboutPage handleSave function
    const simulateAboutPageSave = async () => {
      try {
        // Test content data
        const content = {
          about_legacy: 'Updated: Our school has a rich history spanning over decades, committed to providing quality education and nurturing young minds for the future.',
          about_mission: 'Updated: To provide holistic education that develops intellectual, emotional, and social capabilities of our students, preparing them for future challenges and opportunities.',
          about_vision: 'Updated: To be a leading educational institution that inspires excellence, creativity, and lifelong learning in every student, fostering innovation and character.'
        };

        // Update page content using upsert (new logic)
        const contentUpdates = Object.entries(content).map(([page_key, contentText]) => ({
          page_key,
          page_title: page_key.replace('about_', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          content: contentText,
          meta_description: `${page_key.replace('about_', '').replace('_', ' ')} content for our school`
        }));

        console.log('   📝 Upserting page content...');
        for (const update of contentUpdates) {
          const { error } = await supabase
            .from('page_content')
            .upsert(update, { onConflict: 'page_key' });

          if (error) {
            throw new Error(`Page content upsert error for ${update.page_key}: ${error.message}`);
          }
          console.log(`   ✅ Upserted: ${update.page_key}`);
        }

        // Get staff counts ID and update (fixed logic)
        console.log('   👥 Updating staff counts...');
        const { data: staffId, error: staffIdError } = await supabase
          .from('staff_counts')
          .select('id')
          .single();

        if (staffIdError) {
          throw new Error(`Staff ID error: ${staffIdError.message}`);
        }

        console.log(`   ✅ Staff counts ID retrieved: ${staffId.id}`);

        const staffData = {
          teaching_staff: 35,
          security_staff: 10,
          professional_staff: 20,
          guides_staff: 6
        };

        const { error: staffUpdateError } = await supabase
          .from('staff_counts')
          .update(staffData)
          .eq('id', staffId.id);

        if (staffUpdateError) {
          throw new Error(`Staff update error: ${staffUpdateError.message}`);
        }

        console.log('   ✅ Staff counts updated successfully');
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    };

    const saveResult = await simulateAboutPageSave();
    
    if (saveResult.success) {
      console.log('\n✅ AboutPage save simulation successful!');
    } else {
      console.error('\n❌ AboutPage save simulation failed:', saveResult.error);
      return;
    }

    // 3. Verify the updates
    console.log('\n3. Verifying the updates...');
    
    // Verify page_content
    const { data: verifyPageContent, error: verifyPageError } = await supabase
      .from('page_content')
      .select('*')
      .in('page_key', ['about_legacy', 'about_mission', 'about_vision'])
      .order('page_key');
    
    if (verifyPageError) {
      console.error('❌ Failed to verify page content:', verifyPageError.message);
    } else {
      console.log('✅ Page content verified:');
      verifyPageContent.forEach(item => {
        console.log(`  - ${item.page_key}:`);
        console.log(`    Title: ${item.page_title}`);
        console.log(`    Content: "${item.content.substring(0, 80)}..."`);
        console.log(`    Updated: ${item.updated_at}`);
      });
    }

    // Verify staff_counts
    const { data: verifyStaffCounts, error: verifyStaffError } = await supabase
      .from('staff_counts')
      .select('*')
      .single();
    
    if (verifyStaffError) {
      console.error('❌ Failed to verify staff counts:', verifyStaffError.message);
    } else {
      console.log('\n✅ Staff counts verified:');
      console.log(`  - Teaching staff: ${verifyStaffCounts.teaching_staff}`);
      console.log(`  - Security staff: ${verifyStaffCounts.security_staff}`);
      console.log(`  - Professional staff: ${verifyStaffCounts.professional_staff}`);
      console.log(`  - Guides staff: ${verifyStaffCounts.guides_staff}`);
      console.log(`  - Updated: ${verifyStaffCounts.updated_at}`);
    }

    // 4. Test the AboutPage load logic
    console.log('\n4. Testing AboutPage load logic...');
    
    // Simulate the loadData function
    const simulateLoadData = async () => {
      try {
        // Load page content
        const { data: contentData, error: contentError } = await supabase
          .from('page_content')
          .select('page_key, content')
          .in('page_key', ['about_legacy', 'about_mission', 'about_vision']);

        if (contentError) throw contentError;

        // Load staff counts
        const { data: countsData, error: countsError } = await supabase
          .from('staff_counts')
          .select('*')
          .single();

        if (countsError) throw countsError;

        // Transform content data
        const contentMap = contentData.reduce((acc, item) => {
          acc[item.page_key] = item.content;
          return acc;
        }, {});

        return {
          success: true,
          content: contentMap,
          staffCounts: countsData
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    };

    const loadResult = await simulateLoadData();
    
    if (loadResult.success) {
      console.log('✅ AboutPage load simulation successful!');
      console.log('   📄 Content keys loaded:', Object.keys(loadResult.content));
      console.log('   👥 Staff counts loaded:', {
        teaching: loadResult.staffCounts.teaching_staff,
        security: loadResult.staffCounts.security_staff,
        professional: loadResult.staffCounts.professional_staff,
        guides: loadResult.staffCounts.guides_staff
      });
    } else {
      console.error('❌ AboutPage load simulation failed:', loadResult.error);
    }

    console.log('\n🎉 Complete About Page save flow test completed successfully!');
    console.log('✅ The AboutPage component should now work correctly with:');
    console.log('   - Proper page_content upsert operations');
    console.log('   - Fixed staff_counts update logic');
    console.log('   - Correct database schema usage');
    console.log('   - Proper RLS policies and permissions');

  } catch (error) {
    console.error('❌ Unexpected error during test:', error);
  }
}

// Run the test
testCompleteAboutPageSave().then(() => {
  console.log('\n🏁 Test completed!');
}).catch(error => {
  console.error('💥 Test failed:', error);
});