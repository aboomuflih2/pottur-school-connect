import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Applying Comprehensive RLS Migration...');
  console.log('=============================================');

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', 'comprehensive_rls_setup.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}...`);
      console.log(`📋 SQL: ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
      
      try {
        const { data, error } = await supabase.rpc('query', { query_text: statement });
        
        if (error) {
          // Try alternative approach with direct SQL execution
          console.log(`⚠️ RPC failed, trying direct approach: ${error.message}`);
          
          // For local Supabase, we can try using the REST API directly
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ query_text: statement })
          });
          
          if (!response.ok) {
            console.log(`❌ Statement ${i + 1} failed: ${response.statusText}`);
            console.log(`📋 Failed SQL: ${statement}`);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (execError) {
        console.log(`❌ Statement ${i + 1} failed: ${execError.message}`);
        console.log(`📋 Failed SQL: ${statement}`);
      }
    }
    
    console.log('\n🎉 Migration application completed!');
    console.log('\n🧪 Testing the migration...');
    
    // Test authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@potturschool.com',
      password: 'admin123'
    });
    
    if (authError) {
      console.log('❌ Auth test failed:', authError.message);
      return;
    }
    
    console.log('✅ Authentication successful');
    
    // Test events insert
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert({
        title: 'Migration Test Event',
        description: 'Testing after migration',
        event_date: new Date().toISOString(),
        location: 'Test Location'
      })
      .select();
    
    if (eventError) {
      console.log('❌ Events insert test failed:', eventError.message);
    } else {
      console.log('✅ Events insert test successful');
      // Clean up
      await supabase.from('events').delete().eq('id', eventData[0].id);
    }
    
    // Test gallery insert
    const { data: galleryData, error: galleryError } = await supabase
      .from('gallery_photos')
      .insert({
        image_url: 'https://example.com/test.jpg',
        title: 'Migration Test Photo',
        description: 'Testing after migration',
        display_order: 1
      })
      .select();
    
    if (galleryError) {
      console.log('❌ Gallery insert test failed:', galleryError.message);
    } else {
      console.log('✅ Gallery insert test successful');
      // Clean up
      await supabase.from('gallery_photos').delete().eq('id', galleryData[0].id);
    }
    
    console.log('\n🏁 Migration and testing completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

applyMigration();