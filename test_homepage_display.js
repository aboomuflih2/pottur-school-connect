// Test if hero slides display correctly on homepage
import { createClient } from '@supabase/supabase-js';

// Use the same configuration as frontend
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testHomepageDisplay() {
  console.log('🏠 Testing hero slides display on homepage...');
  console.log('🔗 Supabase URL:', supabaseUrl);
  
  try {
    // Add a test slide that should appear on homepage
    console.log('\n➕ Adding test slide for homepage display...');
    const testSlide = {
      title: 'Homepage Test Slide',
      subtitle: 'This slide should appear on the homepage',
      image_url: null,
      button_text: 'Visit Homepage',
      button_url: '/',
      order_index: 0, // High priority
      is_active: true,
      slide_title: 'Homepage Test Slide',
      slide_subtitle: 'This slide should appear on the homepage',
      background_image: null,
      button_link: '/',
      display_order: 0
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('hero_slides')
      .insert([testSlide])
      .select();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return;
    }
    
    console.log('✅ Test slide added:', insertData[0].id);
    
    // Query slides as the homepage would
    console.log('\n📖 Querying active slides (as homepage would)...');
    const { data: activeSlides, error: queryError } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (queryError) {
      console.error('❌ Query error:', queryError);
    } else {
      console.log(`✅ Found ${activeSlides.length} active slides for homepage`);
      console.log('\n📋 Active slides (in display order):');
      activeSlides.forEach((slide, index) => {
        console.log(`${index + 1}. "${slide.slide_title || slide.title}" (order: ${slide.display_order || slide.order_index})`);
      });
      
      // Check if our test slide is first
      if (activeSlides.length > 0 && activeSlides[0].id === insertData[0].id) {
        console.log('\n🎉 SUCCESS: Test slide appears first on homepage!');
      } else {
        console.log('\n⚠️ Test slide not appearing first. Check display_order logic.');
      }
    }
    
    // Clean up
    console.log('\n🧹 Cleaning up test slide...');
    const { error: deleteError } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', insertData[0].id);
    
    if (deleteError) {
      console.error('❌ Cleanup error:', deleteError);
    } else {
      console.log('✅ Test slide cleaned up');
    }
    
    console.log('\n🎯 Homepage display test completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testHomepageDisplay();