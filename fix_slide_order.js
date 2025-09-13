import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function fixSlideOrder() {
  console.log('=== Fixing Slide Order ===');
  
  try {
    // Update the slide with valid image URL to have order_index: 0 (first position)
    const { data: updateData, error: updateError } = await supabase
      .from('hero_slides')
      .update({ order_index: 0 })
      .eq('id', 'd0959c3c-39ad-4fbb-b089-d02969f6e39e')
      .select();
    
    if (updateError) {
      console.error('Error updating slide order:', updateError);
      return;
    }
    
    console.log('✅ Updated slide order successfully');
    console.log('Updated slide:', updateData[0]);
    
    // Also clean up the test slide with invalid data
    const { data: deleteData, error: deleteError } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', '7412fd53-f43f-46be-9782-85dc18a1dee3')
      .select();
    
    if (deleteError) {
      console.error('Error deleting test slide:', deleteError);
    } else {
      console.log('✅ Deleted test slide with invalid data');
    }
    
    // Verify the new order
    console.log('\n=== Verifying New Order ===');
    const { data: verifyData, error: verifyError } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('order_index');
    
    if (verifyError) {
      console.error('Error verifying order:', verifyError);
      return;
    }
    
    console.log('Active slides in order:');
    verifyData.forEach((slide, index) => {
      console.log(`${index + 1}. ${slide.title} (order_index: ${slide.order_index})`);
      console.log(`   Image URL: ${slide.image_url || 'null'}`);
    });
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}