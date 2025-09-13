import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function checkAllHeroData() {
  console.log('=== Checking All hero_slides Records ===');
  
  try {
    // Get all data from hero_slides table
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('display_order');
    
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
    
    console.log('Total records:', data?.length || 0);
    
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        console.log(`\n=== Record ${index + 1} ===`);
        console.log('ID:', record.id);
        console.log('Title:', record.title);
        console.log('Subtitle:', record.subtitle);
        console.log('Image URL:', record.image_url);
        console.log('Button Text:', record.button_text);
        console.log('Button URL:', record.button_url);
        console.log('Order Index:', record.order_index);
        console.log('Display Order:', record.display_order);
        console.log('Is Active:', record.is_active);
        console.log('Created At:', record.created_at);
        console.log('Updated At:', record.updated_at);
        
        // Check if image_url looks like a storage bucket URL
        if (record.image_url && record.image_url.includes('storage')) {
          console.log('✅ This record has a storage bucket URL');
        } else if (record.image_url && record.image_url !== 'test') {
          console.log('⚠️  This record has a custom image URL');
        } else {
          console.log('❌ This record has no valid image URL');
        }
      });
    } else {
      console.log('No records found in hero_slides table');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkAllHeroData();