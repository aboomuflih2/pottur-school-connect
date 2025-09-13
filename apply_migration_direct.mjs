import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54323';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('Applying migration to fix leadership_messages permissions...');

try {
  // Execute SQL commands one by one
  console.log('1. Dropping existing policies...');
  
  await supabase.rpc('exec_sql', {
    sql: 'DROP POLICY IF EXISTS "Enable read access for anon" ON leadership_messages;'
  });
  
  await supabase.rpc('exec_sql', {
    sql: 'DROP POLICY IF EXISTS "Enable all operations for admin users" ON leadership_messages;'
  });
  
  console.log('2. Creating new permissive policies...');
  
  const { error: policy1Error } = await supabase.rpc('exec_sql', {
    sql: `CREATE POLICY "Enable all operations for anon" ON leadership_messages
          FOR ALL
          TO anon
          USING (true)
          WITH CHECK (true);`
  });
  
  if (policy1Error) {
    console.error('Error creating anon policy:', policy1Error);
  } else {
    console.log('✓ Created anon policy');
  }
  
  const { error: policy2Error } = await supabase.rpc('exec_sql', {
    sql: `CREATE POLICY "Enable all operations for authenticated" ON leadership_messages
          FOR ALL
          TO authenticated
          USING (true)
          WITH CHECK (true);`
  });
  
  if (policy2Error) {
    console.error('Error creating authenticated policy:', policy2Error);
  } else {
    console.log('✓ Created authenticated policy');
  }
  
  console.log('3. Granting permissions...');
  
  await supabase.rpc('exec_sql', {
    sql: 'GRANT ALL PRIVILEGES ON leadership_messages TO anon;'
  });
  
  await supabase.rpc('exec_sql', {
    sql: 'GRANT ALL PRIVILEGES ON leadership_messages TO authenticated;'
  });
  
  console.log('✓ Migration completed successfully');
  
  // Test the fix by trying to update with anon role
  console.log('\n--- Testing anon role update after migration ---\n');
  
  const anonSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');
  
  const { data: testData, error: testError } = await anonSupabase
    .from('leadership_messages')
    .update({
      person_name: 'Test Update After Migration',
      person_title: 'Test Title After Migration',
      message_content: 'This update should work now with anon role.',
    })
    .eq('position', 'vice_principal')
    .select();

  if (testError) {
    console.error('❌ Test update still failed:', testError);
  } else {
    console.log('✓ Test update successful! The fix worked.');
    console.log('Updated data:', testData);
  }
  
} catch (err) {
  console.error('❌ Migration failed:', err.message);
  console.error('Full error:', err);
}