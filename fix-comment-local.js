import { createClient } from '@supabase/supabase-js';

// Local Supabase configuration (same as test_connection.js)
const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

console.log('🔧 Fixing comment column using local Supabase...');
console.log('Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCommentColumnLocal() {
  try {
    console.log('\n📋 Checking current table structure...');
    
    // First, try to get some data to see current structure
    const { data: currentData, error: checkError } = await supabase
      .from('article_comments')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Error checking table:', checkError.message);
      
      // If table doesn't exist, let's check if we can see the schema
      console.log('\n🔍 Checking if table exists...');
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'article_comments');
      
      if (tableError) {
        console.error('❌ Cannot access table information:', tableError.message);
        return;
      }
      
      if (!tables || tables.length === 0) {
        console.log('❌ article_comments table does not exist!');
        return;
      }
    }
    
    if (currentData && currentData.length > 0) {
      const columns = Object.keys(currentData[0]);
      console.log('📊 Current columns:', columns.join(', '));
      
      if (columns.includes('comment_text')) {
        console.log('✅ Column comment_text already exists!');
        console.log('🎉 Comment submission should work properly.');
        return;
      }
      
      if (columns.includes('comment_content')) {
        console.log('🔄 Found comment_content column, need to rename to comment_text...');
        console.log('❌ Cannot rename column directly with anon key.');
        console.log('\n📝 Manual fix required:');
        console.log('1. Access your database directly (pgAdmin, psql, or Supabase Dashboard)');
        console.log('2. Run: ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;');
        console.log('\nOr if you have Supabase Dashboard access:');
        console.log('1. Open: http://127.0.0.1:54323');
        console.log('2. Go to SQL Editor');
        console.log('3. Execute the SQL above');
        return;
      }
      
      console.log('❓ Neither comment_content nor comment_text found!');
      console.log('📊 Available columns:', columns.join(', '));
    } else {
      console.log('📋 Table exists but is empty.');
      
      // Try to insert a test record to see what columns are expected
      console.log('\n🧪 Testing table structure with a test insert...');
      
      const testData = {
        article_id: '00000000-0000-0000-0000-000000000000',
        author_name: 'Test Author',
        author_email: 'test@example.com',
        comment_content: 'Test comment',
        is_approved: false
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('article_comments')
        .insert(testData)
        .select();
      
      if (insertError) {
        console.log('❌ Insert with comment_content failed:', insertError.message);
        
        // Try with comment_text
        const testData2 = {
          article_id: '00000000-0000-0000-0000-000000000000',
          author_name: 'Test Author',
          author_email: 'test@example.com',
          comment_text: 'Test comment',
          is_approved: false
        };
        
        const { data: insertData2, error: insertError2 } = await supabase
          .from('article_comments')
          .insert(testData2)
          .select();
        
        if (insertError2) {
          console.log('❌ Insert with comment_text also failed:', insertError2.message);
        } else {
          console.log('✅ Insert with comment_text succeeded!');
          console.log('🎉 The table already uses comment_text column!');
          
          // Clean up test data
          await supabase
            .from('article_comments')
            .delete()
            .eq('author_email', 'test@example.com');
        }
      } else {
        console.log('✅ Insert with comment_content succeeded!');
        console.log('❌ Table still uses comment_content - needs to be renamed to comment_text');
        
        // Clean up test data
        await supabase
          .from('article_comments')
          .delete()
          .eq('author_email', 'test@example.com');
        
        console.log('\n📝 Manual fix required:');
        console.log('ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixCommentColumnLocal();