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
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('Testing actual data update with anon role...');
console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testActualUpdate() {
  try {
    // First, read current data
    console.log('\n1. Reading current data...');
    const { data: beforeData, error: readError } = await supabase
      .from('leadership_messages')
      .select('*')
      .eq('position', 'principal');
    
    if (readError) {
      console.error('❌ Read error:', readError);
      return;
    }
    
    console.log('✓ Current data:', beforeData[0]);
    const originalMessage = beforeData[0].message_content;
    const testMessage = `Updated message at ${new Date().toISOString()}`;
    
    // Perform update with new message
    console.log('\n2. Performing update...');
    console.log('Original message:', originalMessage);
    console.log('New message:', testMessage);
    
    const { data: updateData, error: updateError } = await supabase
      .from('leadership_messages')
      .update({
        message_content: testMessage,
        updated_at: new Date().toISOString()
      })
      .eq('position', 'principal')
      .select();
    
    if (updateError) {
      console.error('❌ Update error:', updateError);
      return;
    }
    
    console.log('✓ Update response:', updateData);
    
    // Verify the update
    console.log('\n3. Verifying update...');
    const { data: afterData, error: verifyError } = await supabase
      .from('leadership_messages')
      .select('*')
      .eq('position', 'principal');
    
    if (verifyError) {
      console.error('❌ Verify error:', verifyError);
      return;
    }
    
    console.log('✓ Data after update:', afterData[0]);
    
    if (afterData[0].message_content === testMessage) {
      console.log('\n🎉 SUCCESS: Data was actually updated!');
    } else {
      console.log('\n❌ FAILED: Data was not updated');
      console.log('Expected:', testMessage);
      console.log('Actual:', afterData[0].message_content);
    }
    
    // Restore original message
    console.log('\n4. Restoring original message...');
    const { error: restoreError } = await supabase
      .from('leadership_messages')
      .update({ message_content: originalMessage })
      .eq('position', 'principal');
    
    if (restoreError) {
      console.error('❌ Restore error:', restoreError);
    } else {
      console.log('✓ Original message restored');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testActualUpdate();