import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function fixHeroOrderFinal() {
  console.log('=== Final Fix for Hero Slide Order ===');
  
  try {
    // First, let's see all current slides
    const { data: currentSlides, error: fetchError } = await supabase
      .from('hero_slides')
      .select('*')
      .order('order_index');
    
    if (fetchError) {
      console.error('Error fetching slides:', fetchError);
      return;
    }
    
    console.log('Current slides:');
    currentSlides.forEach(slide => {
      console.log(`- ${slide.title} (order: ${slide.order_index}, image: ${slide.image_url ? 'valid' : 'invalid'})`);
    });
    
    // Delete the test slide with invalid data
    console.log('\n=== Deleting invalid test slide ===');
    const { error: deleteError } = await supabase
      .from('hero_slides')
      .delete()
      .eq('title', 'test');
    
    if (deleteError) {
      console.error('Error deleting test slide:', deleteError);
    } else {
      console.log('✅ Deleted test slide');
    }
    
    // Update the slide with valid storage URL to be first (order_index: 0)
    console.log('\n=== Setting valid slide as first ===');
    const { data: updateData, error: updateError } = await supabase
      .from('hero_slides')
      .update({ order_index: 0 })
      .eq('id', 'd0959c3c-39ad-4fbb-b089-d02969f6e39e')
      .select();
    
    if (updateError) {
      console.error('Error updating slide order:', updateError);
    } else {
      console.log('✅ Updated slide to be first:', updateData[0]?.title);
    }
    
    // Verify final result
    console.log('\n=== Final Verification ===');
    const { data: finalSlides, error: finalError } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('order_index');
    
    if (finalError) {
      console.error('Error in final verification:', finalError);
      return;
    }
    
    console.log('Final active slides in order:');
    finalSlides.forEach((slide, index) => {
      console.log(`${index + 1}. "${slide.title}" (order: ${slide.order_index})`);
      console.log(`   Image: ${slide.image_url || 'fallback will be used'}`);
      if (slide.image_url && slide.image_url.includes('storage')) {
        console.log('   ✅ Valid storage URL');
      }
    });
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

fixHeroOrderFinal();