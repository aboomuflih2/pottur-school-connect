import { createClient } from '@supabase/supabase-js';

// Local Supabase connection with service role key
const supabaseUrl = 'http://127.0.0.1:54323';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkNewsTable() {
  try {
    console.log('Checking news_posts table structure...');
    
    // Check if table exists and get structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec', {
        sql: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'news_posts' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });
    
    if (tableError) {
      console.error('Error checking table structure:', tableError);
      return;
    }
    
    console.log('Current table structure:', tableInfo);
    
    // Check if slug column exists
    const hasSlugColumn = tableInfo?.some(col => col.column_name === 'slug');
    console.log('Has slug column:', hasSlugColumn);
    
    if (!hasSlugColumn) {
      console.log('Adding slug column...');
      
      const { data: addColumnResult, error: addColumnError } = await supabase
        .rpc('exec', {
          sql: `
            ALTER TABLE news_posts 
            ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
            
            -- Create index for better performance
            CREATE INDEX IF NOT EXISTS idx_news_posts_slug ON news_posts(slug);
          `
        });
      
      if (addColumnError) {
        console.error('Error adding slug column:', addColumnError);
      } else {
        console.log('Successfully added slug column');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkNewsTable();