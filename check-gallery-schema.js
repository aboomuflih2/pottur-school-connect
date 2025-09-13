import { createClient } from '@supabase/supabase-js';

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

console.log('🔍 Checking gallery_photos table schema...');
console.log('Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGallerySchema() {
  try {
    console.log('\n📋 Checking if gallery_photos table exists...');
    
    // First, try to get some data to see current structure
    const { data: currentData, error: checkError } = await supabase
      .from('gallery_photos')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Error checking table:', checkError.message);
      
      // Check if table exists in schema
      console.log('\n🔍 Checking if table exists in schema...');
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'gallery_photos');
      
      if (tableError) {
        console.error('❌ Cannot access table information:', tableError.message);
        return;
      }
      
      if (!tables || tables.length === 0) {
        console.log('❌ gallery_photos table does not exist!');
        console.log('\n📝 Table needs to be created first.');
        return;
      }
    }
    
    if (currentData && currentData.length > 0) {
      const columns = Object.keys(currentData[0]);
      console.log('📊 Current columns in gallery_photos:', columns.join(', '));
      
      if (columns.includes('is_active')) {
        console.log('✅ Column is_active already exists!');
      } else {
        console.log('❌ Column is_active is missing!');
        console.log('📝 Need to add is_active column to gallery_photos table.');
      }
      
      // Show sample data structure
      console.log('\n📄 Sample record structure:');
      console.log(JSON.stringify(currentData[0], null, 2));
    } else {
      console.log('📋 Table exists but is empty.');
      
      // Try to insert a test record to see what columns are expected
      console.log('\n🧪 Testing table structure with a test insert...');
      
      const testData = {
        title: 'Test Photo',
        description: 'Test description',
        image_url: 'test.jpg',
        is_active: true
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('gallery_photos')
        .insert(testData)
        .select();
      
      if (insertError) {
        console.log('❌ Insert with is_active failed:', insertError.message);
        
        // Try without is_active
        const testData2 = {
          title: 'Test Photo',
          description: 'Test description',
          image_url: 'test.jpg'
        };
        
        const { data: insertData2, error: insertError2 } = await supabase
          .from('gallery_photos')
          .insert(testData2)
          .select();
        
        if (insertError2) {
          console.log('❌ Insert without is_active also failed:', insertError2.message);
        } else {
          console.log('✅ Insert without is_active succeeded!');
          console.log('❌ Table does not have is_active column - needs to be added');
          
          // Show what columns exist
          const columns = Object.keys(insertData2[0]);
          console.log('📊 Existing columns:', columns.join(', '));
          
          // Clean up test data
          await supabase
            .from('gallery_photos')
            .delete()
            .eq('title', 'Test Photo');
        }
      } else {
        console.log('✅ Insert with is_active succeeded!');
        console.log('✅ The table already has is_active column!');
        
        // Clean up test data
        await supabase
          .from('gallery_photos')
          .delete()
          .eq('title', 'Test Photo');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkGallerySchema();