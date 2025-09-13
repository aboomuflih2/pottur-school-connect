import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use the frontend client configuration
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function testFrontendConnection() {
  try {
    console.log('Testing frontend connection to academic_programs...');
    console.log('URL:', process.env.VITE_SUPABASE_URL);
    console.log('Key:', process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Present' : 'Missing');
    
    const { data, error } = await supabase
      .from('academic_programs')
      .select('id, program_title, main_image, is_active')
      .eq('is_active', true)
      .order('display_order');
    
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
    
    console.log(`Found ${data.length} active academic programs:`);
    data.forEach((program, index) => {
      console.log(`${index + 1}. ${program.program_title}`);
      console.log(`   Image: ${program.main_image ? 'Has image URL' : 'No image'}`);
      if (program.main_image) {
        console.log(`   URL: ${program.main_image}`);
      }
      console.log('');
    });
    
  } catch (err) {
    console.error('Script error:', err);
  }
}

testFrontendConnection();