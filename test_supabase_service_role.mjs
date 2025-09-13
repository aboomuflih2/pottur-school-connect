import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54323';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('Testing Supabase connection with SERVICE ROLE...');

try {
  // Test connection by reading from leadership_messages table
  const { data, error } = await supabase
    .from('leadership_messages')
    .select('*');

  if (error) {
    console.error('Error reading from leadership_messages:', error);
  } else {
    console.log('✓ Successfully connected to Supabase with service role');
    console.log('✓ leadership_messages table accessible');
    console.log('Found', data.length, 'records');
    console.log('Sample data:', data[0]);
  }

  // Test update operation with service role
  console.log('\nTesting update operation with SERVICE ROLE...');
  const testPosition = data[0]?.position || 'principal';
  
  const { data: updateData, error: updateError } = await supabase
    .from('leadership_messages')
    .update({
      person_name: 'Test Principal Name (Service Role)',
      person_title: 'Test Principal Title (Service Role)',
      message_content: 'This is a test message from the principal using service role.',
    })
    .eq('position', testPosition)
    .select();

  if (updateError) {
    console.error('❌ Error updating leadership_messages:', updateError);
    console.error('Error details:', {
      code: updateError.code,
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint
    });
  } else {
    console.log('✓ Update operation successful with service role');
    console.log('Updated data:', updateData);
  }

  // Test if we can read the updated data
  console.log('\nVerifying update by reading data again...');
  const { data: verifyData, error: verifyError } = await supabase
    .from('leadership_messages')
    .select('*')
    .eq('position', testPosition);

  if (verifyError) {
    console.error('❌ Error verifying update:', verifyError);
  } else {
    console.log('✓ Verification successful');
    console.log('Current data after service role update:', verifyData[0]);
  }

} catch (err) {
  console.error('❌ Connection failed:', err.message);
  console.error('Full error:', err);
}