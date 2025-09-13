import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read environment variables
const envContent = readFileSync('.env', 'utf8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceRoleKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('Fixing RLS policies for leadership_messages table...');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixRLSPolicies() {
  try {
    console.log('\n1. Dropping existing policies...');
    
    // Drop existing policies
    const dropPolicies = [
      'DROP POLICY IF EXISTS "leadership_messages_anon_policy" ON "public"."leadership_messages";',
      'DROP POLICY IF EXISTS "leadership_messages_authenticated_policy" ON "public"."leadership_messages";',
      'DROP POLICY IF EXISTS "anon_select_leadership_messages" ON "public"."leadership_messages";',
      'DROP POLICY IF EXISTS "authenticated_all_leadership_messages" ON "public"."leadership_messages";'
    ];
    
    for (const sql of dropPolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql });
        if (error) {
          console.log(`Note: ${error.message}`);
        } else {
          console.log('✓ Policy dropped');
        }
      } catch (e) {
        // Try direct SQL execution if RPC doesn't work
        console.log('RPC not available, trying direct approach...');
        break;
      }
    }
    
    console.log('\n2. Creating new permissive policies...');
    
    // Create new policies that allow all operations
    const createPolicies = [
      'CREATE POLICY "anon_all_leadership_messages" ON "public"."leadership_messages" AS PERMISSIVE FOR ALL TO "anon" USING (true) WITH CHECK (true);',
      'CREATE POLICY "authenticated_all_leadership_messages" ON "public"."leadership_messages" AS PERMISSIVE FOR ALL TO "authenticated" USING (true) WITH CHECK (true);'
    ];
    
    for (const sql of createPolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql });
        if (error) {
          console.error(`❌ Error creating policy: ${error.message}`);
        } else {
          console.log('✓ Policy created');
        }
      } catch (e) {
        console.log('RPC not available for policy creation');
      }
    }
    
    console.log('\n3. Ensuring table permissions...');
    
    // Grant permissions
    const grantSql = [
      'GRANT ALL PRIVILEGES ON "public"."leadership_messages" TO "anon";',
      'GRANT ALL PRIVILEGES ON "public"."leadership_messages" TO "authenticated";'
    ];
    
    for (const sql of grantSql) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql });
        if (error) {
          console.log(`Note: ${error.message}`);
        } else {
          console.log('✓ Permissions granted');
        }
      } catch (e) {
        console.log('RPC not available for grants');
      }
    }
    
    console.log('\n4. Testing the fix...');
    
    // Test with anon role
    const anonClient = createClient(supabaseUrl, env.VITE_SUPABASE_PUBLISHABLE_KEY);
    const testMessage = `Test update at ${new Date().toISOString()}`;
    
    const { data: updateResult, error: updateError } = await anonClient
      .from('leadership_messages')
      .update({ message_content: testMessage })
      .eq('position', 'principal')
      .select();
    
    if (updateError) {
      console.error('❌ Test update failed:', updateError);
    } else {
      console.log('✓ Test update result:', updateResult);
      
      // Verify the update
      const { data: verifyData, error: verifyError } = await anonClient
        .from('leadership_messages')
        .select('message_content')
        .eq('position', 'principal')
        .single();
      
      if (verifyError) {
        console.error('❌ Verification failed:', verifyError);
      } else {
        if (verifyData.message_content === testMessage) {
          console.log('🎉 SUCCESS: RLS fix worked! Data was updated.');
        } else {
          console.log('❌ FAILED: Data was not updated');
          console.log('Expected:', testMessage);
          console.log('Actual:', verifyData.message_content);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixRLSPolicies();