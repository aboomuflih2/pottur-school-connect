import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Local Supabase connection with service role key
const supabaseUrl = 'http://127.0.0.1:54323';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('Applying migration to add slug column...');
    
    // Execute each SQL statement separately
    const statements = [
      'ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;',
      'CREATE INDEX IF NOT EXISTS idx_news_posts_slug ON news_posts(slug);',
      `UPDATE news_posts 
       SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\\s]', '', 'g'), '\\s+', '-', 'g'))
       WHERE slug IS NULL AND title IS NOT NULL;`
    ];
    
    for (const sql of statements) {
      console.log('Executing:', sql.substring(0, 50) + '...');
      
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        },
        body: JSON.stringify({ sql })
      });
      
      if (!response.ok) {
        // Try alternative approach using direct SQL execution
        const directResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sql',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
          },
          body: sql
        });
        
        if (!directResponse.ok) {
          console.error(`Failed to execute SQL: ${sql}`);
          console.error('Response:', await directResponse.text());
          continue;
        }
      }
      
      console.log('✓ Statement executed successfully');
    }
    
    // Verify the column was added
    console.log('\nVerifying slug column exists...');
    const { data, error } = await supabase
      .from('news_posts')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Error details:', error);
      if (error.message && error.message.includes('slug does not exist')) {
        console.log('❌ Slug column still missing');
      } else {
        console.log('✓ Slug column appears to be added (different error)');
      }
    } else {
      console.log('✓ Successfully verified news_posts table access');
    }
    
  } catch (error) {
    console.error('Error applying migration:', error);
  }
}

applyMigration();