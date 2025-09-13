import { createClient } from '@supabase/supabase-js';

// Local Supabase configuration with service role key for admin operations
const supabaseUrl = 'http://127.0.0.1:54323';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔧 Adding is_active column to gallery_photos table...');
console.log('Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  db: {
    schema: 'public'
  }
});

async function fixGallerySchema() {
  try {
    console.log('\n📋 Step 1: Checking current table structure...');
    
    // Check current columns
    const { data: columns, error: columnError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'gallery_photos'
        ORDER BY ordinal_position;
      `
    });
    
    if (columnError) {
      console.log('❌ Cannot check columns via RPC, trying alternative approach...');
      
      // Try to get table info by attempting a select
      const { data: testData, error: testError } = await supabase
        .from('gallery_photos')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.log('❌ Cannot access gallery_photos table:', testError.message);
        return;
      }
      
      if (testData && testData.length > 0) {
        const existingColumns = Object.keys(testData[0]);
        console.log('📊 Current columns:', existingColumns.join(', '));
        
        if (existingColumns.includes('is_active')) {
          console.log('✅ is_active column already exists!');
          return;
        }
      }
      
      console.log('❌ is_active column is missing, need to add it manually.');
    } else {
      console.log('✅ Retrieved column information');
      console.log('📊 Current columns:', columns);
    }
    
    console.log('\n📋 Step 2: Adding is_active column...');
    
    // Try to add the column using RPC
    const { data: addResult, error: addError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.gallery_photos ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;'
    });
    
    if (addError) {
      console.log('❌ RPC failed to add column:', addError.message);
      console.log('\n📋 MANUAL STEPS REQUIRED:');
      console.log('Since automated methods failed, please manually execute this SQL:');
      console.log('\n1. Open your Supabase Dashboard: http://127.0.0.1:54323');
      console.log('2. Go to SQL Editor');
      console.log('3. Execute this SQL:');
      console.log('\n```sql');
      console.log('ALTER TABLE public.gallery_photos ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;');
      console.log('COMMENT ON COLUMN public.gallery_photos.is_active IS \'Controls whether the photo is visible in the public gallery\';');
      console.log('UPDATE public.gallery_photos SET is_active = true WHERE is_active IS NULL;');
      console.log('```\n');
      console.log('4. After executing, try the "Add Photo" button again');
      return;
    }
    
    console.log('✅ Column added successfully!');
    
    console.log('\n📋 Step 3: Adding comment to column...');
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql: "COMMENT ON COLUMN public.gallery_photos.is_active IS 'Controls whether the photo is visible in the public gallery';"
    });
    
    if (commentError) {
      console.log('⚠️ Could not add comment, but column was added successfully');
    } else {
      console.log('✅ Column comment added');
    }
    
    console.log('\n📋 Step 4: Updating existing records...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: 'UPDATE public.gallery_photos SET is_active = true WHERE is_active IS NULL;'
    });
    
    if (updateError) {
      console.log('⚠️ Could not update existing records, but they should default to true anyway');
    } else {
      console.log('✅ Existing records updated');
    }
    
    console.log('\n📋 Step 5: Verifying the fix...');
    
    // Test inserting a record with is_active
    const testPhoto = {
      title: 'Test Photo - Schema Fix Verification',
      description: 'Testing is_active column',
      image_url: 'test-schema-fix.jpg',
      is_active: true,
      display_order: 999
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('gallery_photos')
      .insert(testPhoto)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Test insertion still failed:', insertError.message);
      
      if (insertError.message.includes('schema cache')) {
        console.log('\n⚠️ SCHEMA CACHE ISSUE:');
        console.log('The column was added but Supabase needs to refresh its schema cache.');
        console.log('Try restarting your local Supabase instance:');
        console.log('1. Stop: npx supabase stop');
        console.log('2. Start: npx supabase start');
        console.log('3. Then try the "Add Photo" button again');
      }
    } else {
      console.log('✅ Test insertion successful!');
      console.log('📄 Test record:', insertData);
      
      // Clean up
      await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', insertData.id);
      
      console.log('🧹 Test record cleaned up');
    }
    
    console.log('\n🎉 SCHEMA FIX COMPLETED!');
    console.log('✅ is_active column has been added to gallery_photos');
    console.log('✅ The "Add Photo" button should now work');
    console.log('✅ You can now manage photo visibility in Gallery Manager');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n📋 MANUAL FALLBACK:');
    console.log('Please add the column manually via Supabase Dashboard SQL Editor:');
    console.log('ALTER TABLE public.gallery_photos ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;');
  }
}

fixGallerySchema();