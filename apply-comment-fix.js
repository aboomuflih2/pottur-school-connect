import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyCommentFix() {
  console.log('🔧 Applying comment column fix...');
  console.log('===============================================');
  
  try {
    // First, check current table structure
    console.log('📋 Checking current table structure...');
    const { data: currentData, error: checkError } = await supabase
      .from('article_comments')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Error checking table:', checkError.message);
      return;
    }
    
    if (currentData && currentData.length > 0) {
      const columns = Object.keys(currentData[0]);
      console.log('📊 Current columns:', columns);
      
      if (columns.includes('comment_text')) {
        console.log('✅ Column comment_text already exists!');
        return;
      }
      
      if (!columns.includes('comment_content')) {
        console.log('❌ Column comment_content not found!');
        return;
      }
    }
    
    // Apply the column rename
    console.log('🚀 Renaming comment_content to comment_text...');
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE public.article_comments 
        RENAME COLUMN comment_content TO comment_text;
        
        COMMENT ON COLUMN public.article_comments.comment_text IS 'Comment text content - renamed from comment_content to match frontend expectations';
      `
    });
    
    if (error) {
      console.error('❌ Error applying fix:', error.message);
      
      // Try alternative approach using raw SQL
      console.log('🔄 Trying alternative approach...');
      const { error: altError } = await supabase
        .from('article_comments')
        .select('comment_content')
        .limit(1);
        
      if (altError && altError.message.includes('column "comment_content" does not exist')) {
        console.log('✅ Column might already be renamed!');
      } else {
        console.log('📋 Manual migration still required');
        console.log('Please run this SQL in your database:');
        console.log('ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;');
      }
      return;
    }
    
    console.log('✅ Column rename successful!');
    
    // Verify the fix
    console.log('🔍 Verifying the fix...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('article_comments')
      .select('comment_text')
      .limit(1);
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log('✅ Verification successful! comment_text column is now available.');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

applyCommentFix();