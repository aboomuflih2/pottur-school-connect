import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔧 Simple comment column fix...');
console.log('Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixCommentColumn() {
  try {
    console.log('\n🧪 Testing current table structure...');
    
    // Test if comment_text column exists by trying to insert
    const testData = {
      article_id: '00000000-0000-0000-0000-000000000000',
      author_name: 'Test User',
      author_email: 'test@example.com',
      comment_text: 'Test comment',
      is_approved: false
    };
    
    const { data: testInsert, error: testError } = await supabase
      .from('article_comments')
      .insert(testData)
      .select();
    
    if (!testError) {
      console.log('✅ comment_text column already exists and works!');
      console.log('🎉 No migration needed.');
      
      // Clean up test data
      await supabase
        .from('article_comments')
        .delete()
        .eq('author_email', 'test@example.com');
      
      return;
    }
    
    if (testError.message.includes('comment_text')) {
      console.log('❌ comment_text column missing:', testError.message);
      console.log('\n🔄 Attempting to rename comment_content to comment_text...');
      
      // Try to execute the ALTER TABLE command
      try {
        // Use a simple SQL execution approach
        const { data: sqlResult, error: sqlError } = await supabase
          .rpc('exec_sql', {
            query: 'ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;'
          });
        
        if (sqlError) {
          console.log('❌ SQL execution failed:', sqlError.message);
          throw new Error('RPC not available');
        }
        
        console.log('✅ Column renamed successfully!');
        
      } catch (rpcError) {
        console.log('❌ Cannot execute SQL directly via RPC.');
        console.log('\n📝 Manual migration required:');
        console.log('\n🌐 Option 1 - Supabase Dashboard:');
        console.log('1. Open: http://127.0.0.1:54323');
        console.log('2. Go to SQL Editor');
        console.log('3. Execute: ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;');
        
        console.log('\n💻 Option 2 - Direct Database Access:');
        console.log('If you have psql installed:');
        console.log('psql -h 127.0.0.1 -p 54322 -U postgres -d postgres');
        console.log('Then run: ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;');
        
        console.log('\n📄 Option 3 - Migration File:');
        console.log('The SQL is already prepared in: supabase/migrations/030_fix_comment_text_column.sql');
        
        return;
      }
      
      // Test the fix
      console.log('\n🧪 Testing the fix...');
      const { data: verifyInsert, error: verifyError } = await supabase
        .from('article_comments')
        .insert(testData)
        .select();
      
      if (verifyError) {
        console.log('❌ Fix verification failed:', verifyError.message);
      } else {
        console.log('✅ Fix verified successfully!');
        console.log('🎉 Comment submission should now work properly.');
        
        // Clean up test data
        await supabase
          .from('article_comments')
          .delete()
          .eq('author_email', 'test@example.com');
      }
      
    } else {
      console.log('❌ Unexpected error:', testError.message);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixCommentColumn();