import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔧 Applying comment column migration directly...');
console.log('Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigrationDirect() {
  try {
    console.log('\n📋 Checking current table structure...');
    
    // Check current columns using information_schema
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'article_comments');
    
    if (columnError) {
      console.error('❌ Error checking columns:', columnError.message);
      return;
    }
    
    const columnNames = columns.map(col => col.column_name);
    console.log('📊 Current columns:', columnNames.join(', '));
    
    if (columnNames.includes('comment_text')) {
      console.log('✅ Column comment_text already exists!');
      console.log('🎉 Migration already applied.');
      return;
    }
    
    if (!columnNames.includes('comment_content')) {
      console.log('❌ Column comment_content not found!');
      console.log('📊 Available columns:', columnNames.join(', '));
      return;
    }
    
    console.log('\n🔄 Applying migration: Renaming comment_content to comment_text...');
    
    // Execute the ALTER TABLE command using raw SQL
    const { data, error } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;'
    });
    
    if (error) {
      console.error('❌ Migration failed with rpc exec:', error.message);
      
      // Try alternative approach with direct query
      console.log('\n🔄 Trying alternative approach...');
      
      // Since we can't execute DDL directly, we need to use the Supabase Dashboard
      console.log('\n📝 Manual migration required:');
      console.log('1. Open Supabase Dashboard: http://127.0.0.1:54323');
      console.log('2. Go to SQL Editor');
      console.log('3. Execute: ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;');
      console.log('\nOr if you have direct database access:');
      console.log('psql -h 127.0.0.1 -p 54322 -U postgres -d postgres');
      console.log('Then run the ALTER TABLE command.');
      
      return;
    }
    
    console.log('✅ Migration executed successfully!');
    console.log('📊 Result:', data);
    
    // Verify the fix
    console.log('\n🧪 Verifying the migration...');
    const { data: newColumns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'article_comments');
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      const newColumnNames = newColumns.map(col => col.column_name);
      console.log('📊 Updated columns:', newColumnNames.join(', '));
      
      if (newColumnNames.includes('comment_text')) {
        console.log('✅ Migration verified successfully!');
        console.log('🎉 Comment submission should now work properly.');
      } else {
        console.log('❌ Migration verification failed - comment_text column not found.');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n📝 Manual fix required - see migration file:');
    console.log('supabase/migrations/030_fix_comment_text_column.sql');
  }
}

applyMigrationDirect();