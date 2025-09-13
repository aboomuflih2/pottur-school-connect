import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function testHeroFetch() {
  console.log('=== Testing Hero Section Data Fetch ===');
  
  try {
    // This is the exact query used by HeroSection component
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('order_index');
    
    if (error) {
      console.error('Error fetching slides:', error);
      return;
    }
    
    console.log('Query successful!');
    console.log('Number of active slides:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('\n=== Active Slides (ordered by order_index) ===');
      data.forEach((slide, index) => {
        console.log(`\nSlide ${index + 1}:`);
        console.log('  ID:', slide.id);
        console.log('  Title:', slide.title);
        console.log('  Subtitle:', slide.subtitle);
        console.log('  Image URL:', slide.image_url);
        console.log('  Button Text:', slide.button_text);
        console.log('  Button URL:', slide.button_url);
        console.log('  Order Index:', slide.order_index);
        console.log('  Display Order:', slide.display_order);
        console.log('  Is Active:', slide.is_active);
        
        // Check image URL validity
        if (slide.image_url && slide.image_url.includes('storage')) {
          console.log('  ✅ Has valid storage URL');
        } else if (slide.image_url) {
          console.log('  ⚠️  Has custom URL:', slide.image_url);
        } else {
          console.log('  ❌ No image URL (will use fallback)');
        }
      });
      
      // Test the first slide's image URL
      const firstSlide = data[0];
      if (firstSlide.image_url) {
        console.log('\n=== Testing First Slide Image URL ===');
        console.log('URL:', firstSlide.image_url);
        
        // Try to fetch the image to see if it's accessible
        try {
          const response = await fetch(firstSlide.image_url, { method: 'HEAD' });
          console.log('Image accessibility test:');
          console.log('  Status:', response.status);
          console.log('  Status Text:', response.statusText);
          console.log('  Content-Type:', response.headers.get('content-type'));
          
          if (response.ok) {
            console.log('  ✅ Image is accessible');
          } else {
            console.log('  ❌ Image is not accessible');
          }
        } catch (fetchError) {
          console.log('  ❌ Error accessing image:', fetchError.message);
        }
      }
    } else {
      console.log('No active slides found');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testHeroFetch();