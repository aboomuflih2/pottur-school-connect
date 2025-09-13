import { createClient } from '@supabase/supabase-js';

// Local Supabase connection with service role key (has admin privileges)
const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function grantAnonPermissions() {
  console.log('🔧 Granting anon role permissions for local development...');
  
  try {
    // Grant SELECT, INSERT, UPDATE, DELETE permissions to anon role on hero_slides table
    console.log('📝 Granting table permissions to anon role...');
    
    const permissions = [
      'GRANT SELECT ON public.hero_slides TO anon;',
      'GRANT INSERT ON public.hero_slides TO anon;',
      'GRANT UPDATE ON public.hero_slides TO anon;',
      'GRANT DELETE ON public.hero_slides TO anon;'
    ];
    
    for (const permission of permissions) {
      console.log(`🔑 Executing: ${permission}`);
      
      // Use direct SQL execution via the REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        },
        body: JSON.stringify({
          sql: permission
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.log(`⚠️ Permission grant response for "${permission}":`, error);
      } else {
        console.log(`✅ Permission granted successfully`);
      }
    }
    
    // Also create a permissive RLS policy for local development
    console.log('🛡️ Creating permissive RLS policy for local development...');
    
    const createPolicySQL = `
      DROP POLICY IF EXISTS "Allow anon full access for local dev" ON public.hero_slides;
      CREATE POLICY "Allow anon full access for local dev" ON public.hero_slides
      FOR ALL TO anon
      USING (true)
      WITH CHECK (true);
    `;
    
    const policyResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        sql: createPolicySQL
      })
    });
    
    if (!policyResponse.ok) {
      const error = await policyResponse.text();
      console.log('⚠️ Policy creation response:', error);
    } else {
      console.log('✅ RLS policy created successfully');
    }
    
    // Test the permissions
    console.log('🧪 Testing anon permissions...');
    
    const anonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');
    
    const testData = {
      slide_title: 'Permission Test Slide',
      slide_subtitle: 'Testing anon permissions',
      background_image: null,
      button_text: 'Test',
      button_link: '/test',
      display_order: 999,
      is_active: true
    };
    
    const { data: insertData, error: insertError } = await anonClient
      .from('hero_slides')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.error('❌ Anon insert test failed:', insertError);
    } else {
      console.log('✅ Anon insert test successful!', insertData);
      
      // Clean up
      await anonClient
        .from('hero_slides')
        .delete()
        .eq('slide_title', 'Permission Test Slide');
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

grantAnonPermissions();