import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabase = createClient(
  'http://63.250.52.6:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function fixRLSPolicies() {
  console.log('Fixing RLS policies directly...');
  
  try {
    // First, let's try to disable RLS temporarily to test
    console.log('Testing with service role (should bypass RLS)...');
    
    const testMember = {
      name: 'Service Role Test',
      designation: 'Test Position',
      board_type: 'governing_board',
      bio: 'Testing with service role',
      email: 'servicetest@example.com',
      display_order: 999
    };
    
    // Test CREATE with service role
    const { data: newMember, error: createError } = await supabase
      .from('board_members')
      .insert(testMember)
      .select()
      .single();
    
    if (createError) {
      console.error('Service role create failed:', createError.message);
      return;
    } else {
      console.log('✅ Service role CREATE works! Created:', newMember.name);
    }
    
    // Test UPDATE with service role
    const { data: updatedMember, error: updateError } = await supabase
      .from('board_members')
      .update({ designation: 'Updated by Service Role' })
      .eq('id', newMember.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Service role update failed:', updateError.message);
    } else {
      console.log('✅ Service role UPDATE works! Updated to:', updatedMember.designation);
    }
    
    // Test DELETE with service role
    const { error: deleteError } = await supabase
      .from('board_members')
      .delete()
      .eq('id', newMember.id);
    
    if (deleteError) {
      console.error('Service role delete failed:', deleteError.message);
    } else {
      console.log('✅ Service role DELETE works! Removed test member');
    }
    
    console.log('\nNow testing with anon role...');
    
    // Test with anon client
    const anonClient = createClient(
      'http://63.250.52.6:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    );
    
    const anonTestMember = {
      name: 'Anon Test Member',
      designation: 'Anon Test Position',
      board_type: 'governing_board',
      bio: 'Testing with anon role',
      email: 'anontest@example.com',
      display_order: 998
    };
    
    const { data: anonMember, error: anonCreateError } = await anonClient
      .from('board_members')
      .insert(anonTestMember)
      .select()
      .single();
    
    if (anonCreateError) {
      console.error('❌ Anon role create failed:', anonCreateError.message);
      console.log('This confirms the RLS policy is blocking anon inserts.');
      
      // Let's check what policies exist
      console.log('\nChecking existing policies...');
      const { data: policies, error: policyError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'board_members');
      
      if (policyError) {
        console.error('Could not fetch policies:', policyError.message);
      } else {
        console.log('Current policies:', policies);
      }
      
    } else {
      console.log('✅ Anon role CREATE works! Created:', anonMember.name);
      
      // Clean up
      await anonClient.from('board_members').delete().eq('id', anonMember.id);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixRLSPolicies().catch(console.error);