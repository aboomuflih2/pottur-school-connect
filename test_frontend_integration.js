// Test frontend integration with local database
import { createClient } from '@supabase/supabase-js';

// Use the same configuration as frontend
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFrontendIntegration() {
  console.log('🧪 Testing frontend integration with local database...');
  console.log('🔗 Supabase URL:', supabaseUrl);
  
  try {
    // Test 1: Check if we can read existing slides
    console.log('\n📖 Test 1: Reading existing hero slides...');
    const { data: existingSlides, error: readError } = await supabase
      .from('hero_slides')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (readError) {
      console.error('❌ Read error:', readError);
    } else {
      console.log(`✅ Found ${existingSlides.length} existing slides`);
      if (existingSlides.length > 0) {
        console.log('📋 Latest slide:', existingSlides[0]);
      }
    }
    
    // Test 2: Submit a new slide (same format as frontend)
    console.log('\n➕ Test 2: Submitting new hero slide...');
    const slideData = {
      slide_title: 'Integration Test Slide',
      slide_subtitle: 'Testing frontend-database integration',
      button_text: 'Learn More',
      button_link: '/about',
      display_order: 999,
      is_active: true,
      background_image: null
    };
    
    // Map to database format (same as frontend code)
    const dbData = {
      title: slideData.slide_title,
      subtitle: slideData.slide_subtitle,
      image_url: slideData.background_image,
      button_text: slideData.button_text,
      button_url: slideData.button_link,
      order_index: slideData.display_order,
      is_active: slideData.is_active,
      // New schema columns
      slide_title: slideData.slide_title,
      slide_subtitle: slideData.slide_subtitle,
      background_image: slideData.background_image,
      button_link: slideData.button_link,
      display_order: slideData.display_order
    };
    
    console.log('📝 Submitting data:', dbData);
    
    const { data: insertData, error: insertError } = await supabase
      .from('hero_slides')
      .insert([dbData])
      .select();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError);
    } else {
      console.log('✅ Insert successful!');
      console.log('📊 Inserted data:', insertData[0]);
      
      // Test 3: Verify the slide appears in the list
      console.log('\n🔍 Test 3: Verifying slide appears in list...');
      const { data: updatedSlides, error: verifyError } = await supabase
        .from('hero_slides')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (verifyError) {
        console.error('❌ Verify error:', verifyError);
      } else {
        console.log(`✅ Now have ${updatedSlides.length} total slides`);
        const latestSlide = updatedSlides[0];
        if (latestSlide.slide_title === 'Integration Test Slide') {
          console.log('🎉 SUCCESS: New slide appears at the top of the list!');
        } else {
          console.log('⚠️ WARNING: New slide not found at top of list');
        }
      }
      
      // Clean up test data
      console.log('\n🧹 Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', insertData[0].id);
      
      if (deleteError) {
        console.error('❌ Cleanup error:', deleteError);
      } else {
        console.log('✅ Test data cleaned up');
      }
    }
    
    console.log('\n🎯 Integration test completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testFrontendIntegration();