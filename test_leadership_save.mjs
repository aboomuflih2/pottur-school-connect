// Test script to debug leadership save functionality
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLeadershipSave() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('leadership_messages')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Connection error:', connectionError);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Test reading existing data
    console.log('\nTesting read access...');
    const { data: readData, error: readError } = await supabase
      .from('leadership_messages')
      .select('*');
    
    if (readError) {
      console.error('❌ Read error:', readError);
    } else {
      console.log('✅ Read successful. Found', readData.length, 'records');
      console.log('Records:', readData);
    }
    
    // Test updating a record (simulating the save functionality)
    console.log('\nTesting update access...');
    const testUpdate = {
      person_name: 'Test Name',
      person_title: 'Test Title',
      message_content: 'Test message content updated at ' + new Date().toISOString()
    };
    
    const { data: updateData, error: updateError } = await supabase
      .from('leadership_messages')
      .update(testUpdate)
      .eq('position', 'chairman')
      .select();
    
    if (updateError) {
      console.error('❌ Update error:', updateError);
      console.error('Error details:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      });
    } else {
      console.log('✅ Update successful');
      console.log('Updated data:', updateData);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testLeadershipSave();