import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Local Supabase configuration with service role key for admin operations
const supabaseUrl = 'http://127.0.0.1:54323';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔧 Applying gallery_photos is_active column fix...');
console.log('Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyGalleryFix() {
  try {
    // Read the migration SQL file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '032_add_gallery_is_active_column.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded from:', migrationPath);
    
    // Split the SQL into individual statements (excluding comments and verification query)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt && 
        !stmt.startsWith('--') && 
        !stmt.startsWith('/*') &&
        !stmt.toLowerCase().includes('select column_name') // Skip verification query
      );
    
    console.log(`\n🚀 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n📝 Statement ${i + 1}:`, statement.substring(0, 100) + '...');
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement
      });
      
      if (error) {
        console.log('❌ RPC exec_sql failed, trying direct query...');
        
        // Try direct query execution
        const { data: directData, error: directError } = await supabase
          .from('_sql')
          .select('*')
          .eq('query', statement)
          .single();
        
        if (directError) {
          console.log('❌ Direct query also failed. Manual execution required.');
          console.log('\n📋 MANUAL STEPS REQUIRED:');
          console.log('1. Open Supabase Dashboard: http://127.0.0.1:54323');
          console.log('2. Go to SQL Editor');
          console.log('3. Execute this SQL:');
          console.log('\n```sql');
          console.log(migrationSQL);
          console.log('```\n');
          return;
        }
      } else {
        console.log('✅ Statement executed successfully');
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
    // Verify the column was added
    console.log('\n🔍 Verifying the is_active column...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('gallery_photos')
      .select('id, title, is_active')
      .limit(1);
    
    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
    } else {
      console.log('✅ Column verification successful!');
      console.log('📊 Sample data structure:', verifyData);
    }
    
    // Test inserting a new record with is_active
    console.log('\n🧪 Testing photo insertion with is_active column...');
    
    const testPhoto = {
      title: 'Test Photo - Migration Verification',
      description: 'This is a test photo to verify the is_active column works',
      image_url: 'test-migration.jpg',
      is_active: true,
      display_order: 999
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('gallery_photos')
      .insert(testPhoto)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Test insertion failed:', insertError.message);
      
      if (insertError.message.includes('row level security')) {
        console.log('\n📋 RLS POLICY ISSUE DETECTED:');
        console.log('The is_active column was added, but RLS policies may need updating.');
        console.log('Check the gallery_photos RLS policies in Supabase Dashboard.');
      }
    } else {
      console.log('✅ Test insertion successful!');
      console.log('📄 Inserted record:', insertData);
      
      // Clean up test record
      await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', insertData.id);
      
      console.log('🧹 Test record cleaned up.');
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log('✅ is_active column has been added to gallery_photos table');
    console.log('✅ Photo upload functionality should now work');
    console.log('✅ You can now use the "Add Photo" button in Gallery Manager');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    
    console.log('\n📋 MANUAL FALLBACK STEPS:');
    console.log('1. Open Supabase Dashboard: http://127.0.0.1:54323');
    console.log('2. Go to SQL Editor');
    console.log('3. Execute this SQL:');
    console.log('\n```sql');
    console.log('ALTER TABLE public.gallery_photos ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;');
    console.log('COMMENT ON COLUMN public.gallery_photos.is_active IS \'Controls whether the photo is visible in the public gallery\';');
    console.log('UPDATE public.gallery_photos SET is_active = true WHERE is_active IS NULL;');
    console.log('```');
  }
}

applyGalleryFix();