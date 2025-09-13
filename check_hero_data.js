import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function checkHeroData() {
  console.log('=== Checking hero_slides Table Data ===');
  
  try {
    // Get all data from hero_slides table
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*');
    
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
    
    console.log('Number of records:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('\n=== Sample Record ===');
      console.log('Available columns:', Object.keys(data[0]));
      console.log('\nFirst record data:');
      console.log(JSON.stringify(data[0], null, 2));
      
      // Check if background_image column exists and has data
      if (data[0].background_image) {
        console.log('\n=== Background Image Info ===');
        console.log('Background image URL:', data[0].background_image);
      }
    } else {
      console.log('No records found in hero_slides table');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkHeroData();