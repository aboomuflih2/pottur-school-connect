import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://63.250.52.6:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function testCRUD() {
  console.log('Testing CRUD operations...');
  
  // Test READ - Get all board members
  console.log('\n1. Testing READ operation:');
  const { data: members, error: readError } = await supabase
    .from('board_members')
    .select('*, social_links(*)')
    .order('display_order');
  
  if (readError) {
    console.error('Read error:', readError.message);
  } else {
    console.log(`Found ${members.length} board members`);
    members.forEach(member => {
      console.log(`- ${member.name} (${member.designation}) - ${member.board_type}`);
    });
  }
  
  // Test CREATE - Add a test member
  console.log('\n2. Testing CREATE operation:');
  const testMember = {
    name: 'Test Member',
    designation: 'Test Position',
    board_type: 'governing_board',
    bio: 'This is a test member for CRUD testing',
    email: 'test@example.com',
    display_order: 999
  };
  
  const { data: newMember, error: createError } = await supabase
    .from('board_members')
    .insert(testMember)
    .select()
    .single();
  
  if (createError) {
    console.error('Create error:', createError.message);
    return;
  } else {
    console.log('Created member:', newMember.name, 'with ID:', newMember.id);
  }
  
  // Test UPDATE - Modify the test member
  console.log('\n3. Testing UPDATE operation:');
  const { data: updatedMember, error: updateError } = await supabase
    .from('board_members')
    .update({ designation: 'Updated Test Position' })
    .eq('id', newMember.id)
    .select()
    .single();
  
  if (updateError) {
    console.error('Update error:', updateError.message);
  } else {
    console.log('Updated member designation to:', updatedMember.designation);
  }
  
  // Test DELETE - Remove the test member
  console.log('\n4. Testing DELETE operation:');
  const { error: deleteError } = await supabase
    .from('board_members')
    .delete()
    .eq('id', newMember.id);
  
  if (deleteError) {
    console.error('Delete error:', deleteError.message);
  } else {
    console.log('Successfully deleted test member');
  }
  
  console.log('\nCRUD operations test completed!');
}

testCRUD().catch(console.error);