import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeCommentMigration() {
  console.log('🚀 Executing comment column migration...');
  console.log('==================================================');
  
  try {
    // Read the migration SQL file
    const migrationPath = join(__dirname, 'supabase', 'migrations', '030_fix_comment_text_column.sql');
    let migrationSQL;
    
    try {
      migrationSQL = readFileSync(migrationPath, 'utf8');
      console.log('✅ Migration SQL loaded from file');
    } catch (err) {
      console.log('⚠️  Migration file not found, using inline SQL');
      migrationSQL = `
-- Fix comment column name in article_comments table
ALTER TABLE public.article_comments 
RENAME COLUMN comment_content TO comment_text;

-- Add comment for clarity
COMMENT ON COLUMN public.article_comments.comment_text IS 'The text content of the comment';

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'article_comments' 
AND table_schema = 'public'
ORDER BY ordinal_position;
      `;
    }
    
    console.log('\n📄 Migration SQL:');
    console.log(migrationSQL);
    
    // Try to execute using rpc if available
    console.log('\n🔄 Attempting to execute migration...');
    
    try {
      // Try using exec_sql function if it exists
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;'
      });
      
      if (error) {
        throw new Error(`RPC exec_sql failed: ${error.message}`);
      }
      
      console.log('✅ Migration executed successfully via RPC!');
      
    } catch (rpcError) {
      console.log('❌ RPC execution failed:', rpcError.message);
      
      // Try alternative approach using raw SQL
      console.log('\n🔄 Trying alternative approach...');
      
      try {
        // Use the SQL editor approach by making a direct request
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            sql_query: 'ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;'
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log('✅ Migration executed successfully via HTTP!');
        
      } catch (httpError) {
        console.log('❌ HTTP execution failed:', httpError.message);
        
        // Final fallback - provide manual instructions
        console.log('\n📝 Automatic execution failed. Manual steps required:');
        console.log('\n🌐 Supabase Dashboard Method:');
        console.log('1. Open: http://127.0.0.1:54323');
        console.log('2. Navigate to: SQL Editor');
        console.log('3. Create a new query');
        console.log('4. Paste and execute:');
        console.log('   ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;');
        console.log('\n💻 Command Line Method (if psql is available):');
        console.log('psql -h 127.0.0.1 -p 54322 -U postgres -d postgres');
        console.log('Then run: ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;');
        
        return false;
      }
    }
    
    // Verify the migration worked
    console.log('\n🔍 Verifying migration...');
    
    try {
      const { error: verifyError } = await supabase
        .from('article_comments')
        .select('comment_text')
        .limit(1);
      
      if (!verifyError) {
        console.log('🎉 SUCCESS! Migration completed successfully!');
        console.log('✅ comment_text column is now available');
        
        // Test comment submission
        console.log('\n🧪 Testing comment submission...');
        
        const testComment = {
          article_id: '00000000-0000-0000-0000-000000000001',
          comment_text: 'Test comment after migration',
          author_name: 'Migration Test',
          author_email: 'test@migration.com'
        };
        
        const { data: insertData, error: insertError } = await supabase
          .from('article_comments')
          .insert([testComment])
          .select();
        
        if (insertError) {
          console.log('⚠️  Test comment insertion failed:', insertError.message);
          if (insertError.message.includes('RLS') || insertError.message.includes('policy')) {
            console.log('   (This might be due to Row Level Security policies - normal for production)');
          }
        } else {
          console.log('✅ Test comment inserted successfully!');
          
          // Clean up test comment
          await supabase
            .from('article_comments')
            .delete()
            .eq('author_email', 'test@migration.com');
          
          console.log('✅ Test comment cleaned up');
        }
        
        console.log('\n🎉 Migration completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Test comment submission in the application');
        console.log('2. Verify comments are being saved with comment_text column');
        console.log('3. Check that existing comments (if any) are still accessible');
        
        return true;
        
      } else {
        console.log('❌ Verification failed:', verifyError.message);
        return false;
      }
      
    } catch (verifyErr) {
      console.log('❌ Verification error:', verifyErr.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

// Run the migration
executeCommentMigration().then(success => {
  if (success) {
    console.log('\n✅ All done! Comment column migration completed.');
  } else {
    console.log('\n❌ Migration requires manual intervention.');
    console.log('Please follow the manual steps provided above.');
  }
});