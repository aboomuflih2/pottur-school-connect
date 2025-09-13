import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugHeroSlides() {
  console.log('=== Hero Slides Debug Analysis ===\n');
  
  try {
    // 1. Check if hero-images storage bucket exists
    console.log('1. Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error fetching buckets:', bucketsError.message);
    } else {
      console.log('✅ Available buckets:', buckets.map(b => b.name));
      const heroImagesBucket = buckets.find(b => b.name === 'hero-images');
      if (heroImagesBucket) {
        console.log('✅ hero-images bucket exists');
      } else {
        console.log('❌ hero-images bucket NOT found');
      }
    }
    
    // 2. Check hero_slides table structure
    console.log('\n2. Checking hero_slides table structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('hero_slides')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Error accessing hero_slides table:', tableError.message);
    } else {
      console.log('✅ hero_slides table accessible');
      if (tableData && tableData.length > 0) {
        console.log('✅ Sample record columns:', Object.keys(tableData[0]));
      }
    }
    
    // 3. Test inserting a simple record without image
    console.log('\n3. Testing simple record insertion...');
    const testRecord = {
      slide_title: 'Test Slide',
      slide_subtitle: 'Test Subtitle',
      button_text: 'Test Button',
      button_link: '/test',
      display_order: 999,
      is_active: false
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('hero_slides')
      .insert([testRecord])
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      console.error('Error details:', insertError);
    } else {
      console.log('✅ Insert successful:', insertData);
      
      // Clean up test record
      if (insertData && insertData.length > 0) {
        await supabase
          .from('hero_slides')
          .delete()
          .eq('id', insertData[0].id);
        console.log('✅ Test record cleaned up');
      }
    }
    
    // 4. Check RLS policies
    console.log('\n4. Checking current user authentication...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Auth error:', userError.message);
    } else if (!user) {
      console.log('❌ No authenticated user - this might be the issue!');
      console.log('💡 Hero slides operations may require authentication');
    } else {
      console.log('✅ Authenticated user:', user.email);
      
      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (roleError) {
        console.log('❌ No role found for user:', roleError.message);
      } else {
        console.log('✅ User role:', roleData.role);
      }
    }
    
    // 5. Test image upload to storage
    console.log('\n5. Testing image upload capability...');
    const testImageData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
    const testFileName = `test-${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('hero-images')
      .upload(testFileName, testImageData, {
        contentType: 'image/png'
      });
    
    if (uploadError) {
      console.error('❌ Image upload failed:', uploadError.message);
      console.error('Upload error details:', uploadError);
    } else {
      console.log('✅ Image upload successful:', uploadData.path);
      
      // Clean up test image
      await supabase.storage
        .from('hero-images')
        .remove([testFileName]);
      console.log('✅ Test image cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
  
  console.log('\n=== Debug Analysis Complete ===');
}

// Run the debug
debugHeroSlides().catch(console.error);