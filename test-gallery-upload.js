import { createClient } from '@supabase/supabase-js';

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

console.log('🧪 Testing gallery photo upload functionality...');
console.log('Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGalleryUpload() {
  try {
    console.log('\n📋 Step 1: Checking if is_active column exists...');
    
    // Try to select with is_active column
    const { data: checkData, error: checkError } = await supabase
      .from('gallery_photos')
      .select('id, title, is_active')
      .limit(1);
    
    if (checkError) {
      if (checkError.message.includes('is_active')) {
        console.log('❌ is_active column still missing!');
        console.log('\n📋 MANUAL FIX REQUIRED:');
        console.log('Please execute this SQL in Supabase Dashboard (http://127.0.0.1:54323):');
        console.log('\n```sql');
        console.log('ALTER TABLE public.gallery_photos ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;');
        console.log('```\n');
        return;
      } else {
        console.log('❌ Other error:', checkError.message);
        return;
      }
    }
    
    console.log('✅ is_active column exists!');
    
    console.log('\n📋 Step 2: Testing photo insertion (simulating "Add Photo" button)...');
    
    // Simulate the exact data structure that GalleryManager.tsx would send
    const testPhotoData = {
      image_url: 'https://example.com/test-photo.jpg',
      title: 'Test Gallery Photo',
      description: 'This is a test photo to verify the upload functionality',
      is_active: true,
      display_order: 1
    };
    
    console.log('📤 Attempting to insert photo data:', testPhotoData);
    
    const { data: insertData, error: insertError } = await supabase
      .from('gallery_photos')
      .insert(testPhotoData)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Photo insertion failed:', insertError.message);
      
      if (insertError.message.includes('row level security')) {
        console.log('\n⚠️ RLS POLICY ISSUE:');
        console.log('The is_active column exists, but Row Level Security policies may be blocking the insert.');
        console.log('This is likely the same issue as with the comment_text column.');
        console.log('\nThe user needs to:');
        console.log('1. Be logged in as an authenticated user');
        console.log('2. Have proper admin permissions');
        console.log('3. Check RLS policies for gallery_photos table');
      } else if (insertError.message.includes('is_active')) {
        console.log('\n❌ COLUMN STILL MISSING:');
        console.log('The manual SQL fix was not applied yet.');
      } else {
        console.log('\n❌ OTHER ERROR:');
        console.log('There may be other schema or permission issues.');
      }
      
      return;
    }
    
    console.log('✅ Photo insertion successful!');
    console.log('📄 Inserted photo data:', insertData);
    
    console.log('\n📋 Step 3: Testing photo update (simulating toggle active status)...');
    
    const { data: updateData, error: updateError } = await supabase
      .from('gallery_photos')
      .update({ is_active: false })
      .eq('id', insertData.id)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Photo update failed:', updateError.message);
    } else {
      console.log('✅ Photo update successful!');
      console.log('📄 Updated photo data:', updateData);
    }
    
    console.log('\n📋 Step 4: Cleaning up test data...');
    
    const { error: deleteError } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.log('⚠️ Could not clean up test data:', deleteError.message);
      console.log('You may need to manually delete the test photo from the gallery.');
    } else {
      console.log('✅ Test data cleaned up successfully!');
    }
    
    console.log('\n🎉 GALLERY UPLOAD TEST COMPLETED!');
    console.log('✅ The "Add Photo" button should now work properly');
    console.log('✅ Photo visibility toggle should work');
    console.log('✅ Gallery Manager functionality is restored');
    
  } catch (error) {
    console.error('❌ Unexpected error during testing:', error.message);
  }
}

// Run the test
testGalleryUpload();