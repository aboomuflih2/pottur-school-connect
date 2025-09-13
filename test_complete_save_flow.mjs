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
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🧪 Testing complete save flow for Leadership Manager...');

// Create both admin and regular clients
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const regularSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    persistSession: false,
    autoRefreshToken: false,
  }
});

try {
  // Step 1: Read current data (simulating frontend load)
  console.log('\n📖 Step 1: Loading current leadership data (as frontend would)...');
  const { data: initialData, error: loadError } = await regularSupabase
    .from('leadership_messages')
    .select('*')
    .order('position');
  
  if (loadError) {
    console.error('❌ Failed to load data:', loadError);
    process.exit(1);
  }
  
  console.log('✅ Loaded', initialData.length, 'leadership records');
  initialData.forEach(record => {
    console.log(`  ${record.position}: ${record.person_name} - "${record.message_content?.substring(0, 40)}..."`);
  });
  
  // Step 2: Simulate admin form submission (using admin client)
  const testPosition = 'chairman';
  const originalRecord = initialData.find(r => r.position === testPosition);
  
  if (!originalRecord) {
    console.error('❌ Test position not found:', testPosition);
    process.exit(1);
  }
  
  console.log(`\n✏️ Step 2: Simulating admin form save for position "${testPosition}"...`);
  
  const testData = {
    person_name: 'Test Admin Update',
    person_title: 'Updated via Admin Form',
    message_content: `This message was updated via admin form at ${new Date().toISOString()}`,
  };
  
  console.log('Saving data:', testData);
  
  // This simulates the exact operation the frontend admin form does
  const { data: saveResult, error: saveError } = await adminSupabase
    .from('leadership_messages')
    .update(testData)
    .eq('position', testPosition)
    .select();
  
  if (saveError) {
    console.error('❌ Save failed:', saveError);
    process.exit(1);
  }
  
  console.log('✅ Save successful!');
  console.log('Save result:', saveResult);
  
  // Step 3: Verify the update (simulating frontend refresh)
  console.log('\n🔍 Step 3: Verifying update (simulating frontend refresh)...');
  const { data: verifyData, error: verifyError } = await regularSupabase
    .from('leadership_messages')
    .select('*')
    .eq('position', testPosition)
    .single();
  
  if (verifyError) {
    console.error('❌ Verification failed:', verifyError);
    process.exit(1);
  }
  
  console.log('✅ Verification successful!');
  console.log('Updated record:');
  console.log(`  Name: ${verifyData.person_name}`);
  console.log(`  Title: ${verifyData.person_title}`);
  console.log(`  Message: ${verifyData.message_content}`);
  
  // Check if the update was actually applied
  const updateSuccess = (
    verifyData.person_name === testData.person_name &&
    verifyData.person_title === testData.person_title &&
    verifyData.message_content === testData.message_content
  );
  
  if (updateSuccess) {
    console.log('\n🎉 SUCCESS: Complete save flow works perfectly!');
    console.log('✅ Data is properly saved to database');
    console.log('✅ Data can be retrieved by frontend');
    console.log('✅ Admin form save functionality is working');
  } else {
    console.log('\n⚠️ WARNING: Data mismatch detected');
    console.log('Expected:', testData);
    console.log('Actual:', {
      person_name: verifyData.person_name,
      person_title: verifyData.person_title,
      message_content: verifyData.message_content
    });
  }
  
  // Step 4: Restore original data
  console.log('\n🔄 Step 4: Restoring original data...');
  const { error: restoreError } = await adminSupabase
    .from('leadership_messages')
    .update({
      person_name: originalRecord.person_name,
      person_title: originalRecord.person_title,
      message_content: originalRecord.message_content,
    })
    .eq('position', testPosition);
  
  if (restoreError) {
    console.error('❌ Restore failed:', restoreError);
  } else {
    console.log('✅ Original data restored');
  }
  
  console.log('\n🎯 Complete save flow test finished!');
  
} catch (error) {
  console.error('💥 Test failed with error:', error);
  process.exit(1);
}