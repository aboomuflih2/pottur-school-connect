import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Parse environment variables from .env file
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
  }
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Testing admin client with service role...');
console.log('URL:', SUPABASE_URL);
console.log('Service Role Key:', SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing');

// Create admin client
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

try {
  // Test 1: Read current data
  console.log('\n📖 Reading current leadership messages...');
  const { data: currentData, error: readError } = await adminSupabase
    .from('leadership_messages')
    .select('*')
    .order('position');
  
  if (readError) {
    console.error('❌ Read error:', readError);
    process.exit(1);
  }
  
  console.log('✅ Current data:', currentData.length, 'records');
  currentData.forEach(record => {
    console.log(`  Position "${record.position}": ${record.person_name} - ${record.message_content?.substring(0, 50)}...`);
  });
  
  // Use the first record's position for testing
  const testPosition = currentData[0]?.position;
  if (!testPosition) {
    console.error('❌ No records found to test with');
    process.exit(1);
  }
  
  console.log(`\n✏️ Testing update operation on position: "${testPosition}"...`);
  const testMessage = `Admin test update - ${new Date().toISOString()}`;
  
  const { data: updateData, error: updateError } = await adminSupabase
    .from('leadership_messages')
    .update({
      message_content: testMessage
    })
    .eq('position', testPosition)
    .select();
  
  if (updateError) {
    console.error('❌ Update error:', updateError);
    process.exit(1);
  }
  
  console.log('✅ Update successful!');
  console.log('Updated data:', updateData);
  
  // Test 3: Verify the update
  console.log('\n🔍 Verifying update...');
  const { data: verifyData, error: verifyError } = await adminSupabase
    .from('leadership_messages')
    .select('message_content')
    .eq('position', testPosition)
    .single();
  
  if (verifyError) {
    console.error('❌ Verify error:', verifyError);
    process.exit(1);
  }
  
  if (verifyData.message_content === testMessage) {
    console.log('🎉 SUCCESS: Update verified! Message content matches.');
  } else {
    console.log('⚠️ WARNING: Update not reflected.');
    console.log('Expected:', testMessage);
    console.log('Actual:', verifyData.message_content);
  }
  
  // Test 4: Restore original content
  console.log('\n🔄 Restoring original content...');
  const originalContent = currentData.find(r => r.position === testPosition)?.message_content;
  
  if (originalContent) {
    const { error: restoreError } = await adminSupabase
      .from('leadership_messages')
      .update({ message_content: originalContent })
      .eq('position', testPosition);
    
    if (restoreError) {
      console.error('❌ Restore error:', restoreError);
    } else {
      console.log('✅ Original content restored');
    }
  }
  
  console.log('\n🎯 Admin client test completed successfully!');
  
} catch (error) {
  console.error('💥 Test failed:', error);
  process.exit(1);
}