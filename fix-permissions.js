import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabase = createClient(
  'http://63.250.52.6:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function fixPermissions() {
  console.log('Fixing permissions for board_members and social_links tables...');
  
  try {
    // Grant permissions for board_members table
    const queries = [
      'GRANT SELECT ON board_members TO anon;',
      'GRANT ALL PRIVILEGES ON board_members TO authenticated;',
      'GRANT SELECT ON social_links TO anon;',
      'GRANT ALL PRIVILEGES ON social_links TO authenticated;'
    ];
    
    for (const query of queries) {
      console.log('Executing:', query);
      const { data, error } = await supabase.rpc('exec', { sql: query });
      if (error) {
        console.error('Error executing query:', error.message);
      } else {
        console.log('Success');
      }
    }
    
    // Test the permissions by trying to create a record
    console.log('\nTesting permissions with anon role...');
    const anonClient = createClient(
      'http://63.250.52.6:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    );
    
    const testMember = {
      name: 'Test Member',
      designation: 'Test Position',
      board_type: 'governing_board',
      bio: 'This is a test member',
      email: 'test@example.com',
      display_order: 999
    };
    
    const { data: newMember, error: createError } = await anonClient
      .from('board_members')
      .insert(testMember)
      .select()
      .single();
    
    if (createError) {
      console.error('Still getting error:', createError.message);
    } else {
      console.log('Success! Created test member:', newMember.name);
      
      // Clean up - delete the test member
      await anonClient.from('board_members').delete().eq('id', newMember.id);
      console.log('Cleaned up test member');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixPermissions().catch(console.error);