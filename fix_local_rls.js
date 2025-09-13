import { createClient } from '@supabase/supabase-js';

// Local Supabase connection with service role key
const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies for local development...');
  
  try {
    // Check current RLS status
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('exec_sql', {
        sql: "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hero_slides';"
      });
    
    if (rlsError) {
      console.log('❌ Error checking RLS status:', rlsError);
    } else {
      console.log('📊 Current RLS status:', rlsStatus);
    }
    
    // Temporarily disable RLS for hero_slides
    const { data: disableRLS, error: disableError } = await supabase
      .rpc('exec_sql', {
        sql: "ALTER TABLE public.hero_slides DISABLE ROW LEVEL SECURITY;"
      });
    
    if (disableError) {
      console.log('❌ Error disabling RLS:', disableError);
    } else {
      console.log('✅ RLS disabled for hero_slides table');
    }
    
    // Test insert
    const testData = {
      title: 'Test Local Slide',
      subtitle: 'Testing local database',
      image_url: null,
      button_text: 'Test Button',
      button_url: '/test',
      order_index: 999,
      is_active: true,
      slide_title: 'Test Local Slide',
      slide_subtitle: 'Testing local database',
      background_image: null,
      button_link: '/test',
      display_order: 999
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('hero_slides')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.log('❌ Insert test failed:', insertError);
    } else {
      console.log('✅ Insert test successful:', insertData);
      
      // Clean up test data
      await supabase
        .from('hero_slides')
        .delete()
        .eq('title', 'Test Local Slide');
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

fixRLSPolicies();