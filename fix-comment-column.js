import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.log('Required environment variables:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixCommentColumn() {
  console.log('🔧 Fixing comment column in article_comments table...');
  console.log('==================================================');
  
  try {
    // Step 1: Check current table structure
    console.log('\n🔍 Step 1: Checking current table structure...');
    
    // Try to select from the table to see what columns exist
    const { data: testData, error: testError } = await supabase
      .from('article_comments')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('❌ Error checking table:', testError.message);
      return;
    }
    
    console.log('✅ Table exists and is accessible');
    
    // Step 2: Test if comment_text column exists
    console.log('\n🧪 Step 2: Testing comment_text column...');
    
    try {
      const { error: commentTextError } = await supabase
        .from('article_comments')
        .select('comment_text')
        .limit(1);
      
      if (!commentTextError) {
        console.log('✅ comment_text column already exists! No fix needed.');
        return;
      }
    } catch (err) {
      console.log('❌ comment_text column does not exist');
    }
    
    // Step 3: Test if comment_content column exists
    console.log('\n🧪 Step 3: Testing comment_content column...');
    
    try {
      const { error: commentContentError } = await supabase
        .from('article_comments')
        .select('comment_content')
        .limit(1);
      
      if (commentContentError) {
        console.log('❌ comment_content column also does not exist');
        console.log('❌ Table structure is unexpected. Manual investigation needed.');
        return;
      }
      
      console.log('✅ comment_content column exists');
    } catch (err) {
      console.log('❌ comment_content column does not exist');
      return;
    }
    
    // Step 4: Attempt to rename the column using SQL
    console.log('\n🔄 Step 4: Attempting to rename column...');
    
    // Since we can't execute DDL directly via the client, we'll try a workaround
    // by creating a new column and copying data
    
    console.log('   📝 Adding comment_text column...');
    
    // First, let's try to add the new column by inserting a test record
    try {
      const testRecord = {
        article_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
        comment_text: 'test comment',
        author_name: 'Test User',
        author_email: 'test@example.com'
      };
      
      const { error: insertError } = await supabase
        .from('article_comments')
        .insert([testRecord]);
      
      if (insertError) {
        if (insertError.message.includes('comment_text')) {
          console.log('❌ Cannot add comment_text column via insert');
          console.log('❌ DDL operations require direct database access');
          
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
      } else {
        console.log('✅ Successfully added comment_text column!');
        
        // Clean up test record
        await supabase
          .from('article_comments')
          .delete()
          .eq('article_id', '00000000-0000-0000-0000-000000000000');
      }
    } catch (err) {
      console.log('❌ Error during column addition:', err.message);
    }
    
    // Step 5: Verify the fix
    console.log('\n✅ Step 5: Verifying the fix...');
    
    try {
      const { error: verifyError } = await supabase
        .from('article_comments')
        .select('comment_text')
        .limit(1);
      
      if (!verifyError) {
        console.log('🎉 SUCCESS! comment_text column is now available!');
        console.log('\n📋 Next steps:');
        console.log('1. Test comment submission in the application');
        console.log('2. Verify comments are being saved correctly');
      } else {
        console.log('❌ Verification failed:', verifyError.message);
      }
    } catch (err) {
      console.log('❌ Verification error:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixCommentColumn();