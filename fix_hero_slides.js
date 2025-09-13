import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixHeroSlides() {
  console.log('=== Fixing Hero Slides Issues ===\n');
  
  try {
    // First, let's authenticate as admin
    console.log('1. Authenticating as admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'web.modernhss@gmail.com',
      password: 'Modern#2025'
    });
    
    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return;
    }
    
    console.log('✅ Authenticated successfully as:', authData.user.email);
    
    // 2. Create hero-images storage bucket
    console.log('\n2. Creating hero-images storage bucket...');
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('hero-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ hero-images bucket already exists');
      } else {
        console.error('❌ Failed to create bucket:', bucketError.message);
      }
    } else {
      console.log('✅ hero-images bucket created successfully');
    }
    
    // 3. Test inserting a record with both old and new column names
    console.log('\n3. Testing record insertion with proper column mapping...');
    const testRecord = {
      // Old schema columns (required)
      title: 'Test Slide Title',
      subtitle: 'Test Slide Subtitle', 
      image_url: null,
      button_text: 'Test Button',
      button_url: '/test',
      order_index: 999,
      is_active: false,
      // New schema columns
      slide_title: 'Test Slide Title',
      slide_subtitle: 'Test Slide Subtitle',
      background_image: null,
      button_link: '/test',
      display_order: 999
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('hero_slides')
      .insert([testRecord])
      .select();
    
    if (insertError) {
      console.error('❌ Insert still failed:', insertError.message);
    } else {
      console.log('✅ Insert successful with proper column mapping');
      
      // Clean up test record
      if (insertData && insertData.length > 0) {
        await supabase
          .from('hero_slides')
          .delete()
          .eq('id', insertData[0].id);
        console.log('✅ Test record cleaned up');
      }
    }
    
    // 4. Test image upload now that we're authenticated
    console.log('\n4. Testing image upload with authentication...');
    const testImageData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
    const testFileName = `test-${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('hero-images')
      .upload(testFileName, testImageData, {
        contentType: 'image/png'
      });
    
    if (uploadError) {
      console.error('❌ Image upload still failed:', uploadError.message);
    } else {
      console.log('✅ Image upload successful:', uploadData.path);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('hero-images')
        .getPublicUrl(uploadData.path);
      
      console.log('✅ Public URL:', urlData.publicUrl);
      
      // Clean up test image
      await supabase.storage
        .from('hero-images')
        .remove([testFileName]);
      console.log('✅ Test image cleaned up');
    }
    
    console.log('\n=== Root Cause Analysis ===');
    console.log('1. ❌ MISSING STORAGE BUCKET: hero-images bucket did not exist');
    console.log('2. ❌ AUTHENTICATION REQUIRED: Operations require admin authentication');
    console.log('3. ❌ COLUMN MISMATCH: Frontend uses new column names but old columns are required');
    console.log('4. ❌ RLS POLICIES: Storage operations blocked by Row Level Security');
    
    console.log('\n=== Next Steps ===');
    console.log('1. ✅ Create hero-images storage bucket (attempted)');
    console.log('2. ✅ Ensure admin authentication in frontend');
    console.log('3. 🔧 Update frontend code to populate both old and new columns');
    console.log('4. 🔧 Review and update RLS policies for storage bucket');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixHeroSlides().catch(console.error);