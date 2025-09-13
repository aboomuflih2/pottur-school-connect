import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Use service role key for admin operations
const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔧 Applying comment column fix with service role...');
console.log('Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyCommentFix() {
  try {
    console.log('\n📋 Reading migration file...');
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '030_fix_comment_text_column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration content:');
    console.log(migrationSQL);
    
    console.log('\n🔄 Executing migration...');
    
    // Execute the ALTER TABLE command
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;"
    });
    
    if (error) {
      console.error('❌ Migration failed:', error.message);
      
      // Try alternative approach - direct query
      console.log('\n🔄 Trying alternative approach...');
      const { data: altData, error: altError } = await supabase
        .from('article_comments')
        .select('*')
        .limit(0); // Just to test connection
      
      if (altError) {
        console.error('❌ Cannot connect to table:', altError.message);
      } else {
        console.log('✅ Table connection works, but column rename requires direct database access.');
        console.log('\n📝 Manual steps required:');
        console.log('1. Open Supabase Dashboard: http://127.0.0.1:54323');
        console.log('2. Go to SQL Editor');
        console.log('3. Execute: ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;');
        console.log('\nOr use psql if available:');
        console.log('psql -h 127.0.0.1 -p 54322 -U postgres -d postgres');
        console.log('Then run the ALTER TABLE command.');
      }
    } else {
      console.log('✅ Migration executed successfully!');
      console.log('📊 Result:', data);
      
      // Verify the fix
      console.log('\n🧪 Testing comment submission...');
      const testComment = {
        article_id: '00000000-0000-0000-0000-000000000000',
        author_name: 'Test User',
        author_email: 'test@example.com',
        comment_text: 'Test comment after fix',
        is_approved: false
      };
      
      const { data: testData, error: testError } = await supabase
        .from('article_comments')
        .insert(testComment)
        .select();
      
      if (testError) {
        console.log('❌ Test comment failed:', testError.message);
      } else {
        console.log('✅ Test comment succeeded!');
        console.log('🎉 Comment submission should now work properly.');
        
        // Clean up test data
        await supabase
          .from('article_comments')
          .delete()
          .eq('author_email', 'test@example.com');
        console.log('🧹 Test data cleaned up.');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n📝 Manual fix required - see migration file:');
    console.log('supabase/migrations/030_fix_comment_text_column.sql');
  }
}

applyCommentFix();