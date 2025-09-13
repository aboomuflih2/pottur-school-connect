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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixCommentColumn() {
  console.log('🔧 Fixing comment column in article_comments table...');
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
      console.log('📊 Current columns:', columns.join(', '));
      
      if (columns.includes('comment_text')) {
        console.log('✅ Column comment_text already exists!');
        return;
      }
      
      if (columns.includes('comment_content')) {
        console.log('🔄 Found comment_content column, renaming to comment_text...');
        
        // Execute the rename using exec_sql RPC
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: 'ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;'
        });
        
        if (error) {
          console.error('❌ Error renaming column:', error.message);
          console.log('\n📝 Manual SQL to run in Supabase Dashboard:');
          console.log('ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;');
          return;
        }
        
        console.log('✅ Column renamed successfully!');
        
        // Verify the change
        console.log('🔍 Verifying the change...');
        const { data: verifyData, error: verifyError } = await supabase
          .from('article_comments')
          .select('*')
          .limit(1);
        
        if (verifyError) {
          console.error('❌ Error verifying change:', verifyError.message);
        } else {
          const newColumns = verifyData.length > 0 ? Object.keys(verifyData[0]) : [];
          console.log('📊 Updated columns:', newColumns.join(', '));
          
          if (newColumns.includes('comment_text')) {
            console.log('🎉 SUCCESS! Column comment_text is now available!');
            console.log('\n✅ Comment submission should now work properly.');
          } else {
            console.log('❌ Verification failed - comment_text column not found');
          }
        }
      } else {
        console.log('❓ Neither comment_content nor comment_text found in table');
        console.log('📊 Available columns:', columns.join(', '));
      }
    } else {
      console.log('📋 Table is empty, checking schema...');
      
      // Try to get table schema information
      const { data: schemaData, error: schemaError } = await supabase
        .rpc('exec_sql', {
          sql_query: `SELECT column_name FROM information_schema.columns WHERE table_name = 'article_comments' AND table_schema = 'public';`
        });
      
      if (schemaError) {
        console.error('❌ Error getting schema:', schemaError.message);
      } else {
        console.log('📊 Table schema:', schemaData);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n📝 Manual steps to fix:');
    console.log('1. Open Supabase Dashboard: http://127.0.0.1:54323');
    console.log('2. Go to SQL Editor');
    console.log('3. Run: ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;');
  }
}

fixCommentColumn();