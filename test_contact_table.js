import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testContactTable() {
  try {
    console.log('\n1. Testing table existence and read access...');
    const { data: existingData, error: readError } = await supabase
      .from('contact_page_content')
      .select('*')
      .limit(5);
    
    if (readError) {
      console.error('❌ Read error:', readError);
      return;
    }
    
    console.log('✅ Table exists and readable');
    console.log('📊 Existing records:', existingData?.length || 0);
    
    console.log('\n2. Testing insert permissions...');
    const testData = {
      content_type: 'contact_info',
      title: 'Test Contact',
      content: 'This is a test contact entry',
      additional_data: { test: true },
      display_order: 999,
      is_active: true
    };
    
    console.log('📝 Attempting to insert:', testData);
    
    const { data: insertData, error: insertError } = await supabase
      .from('contact_page_content')
      .insert([testData])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert error:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint
      });
      return;
    }
    
    console.log('✅ Insert successful:', insertData);
    
    // Clean up test data
    console.log('\n3. Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('contact_page_content')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.error('⚠️ Delete error (test data may remain):', deleteError);
    } else {
      console.log('✅ Test data cleaned up');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Test authentication status
async function testAuth() {
  console.log('\n🔐 Testing authentication...');
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('❌ Auth error:', error);
    return;
  }
  
  if (session) {
    console.log('✅ User authenticated:', session.user.email);
  } else {
    console.log('ℹ️ No active session (anonymous access)');
  }
}

// Run tests
async function runTests() {
  await testAuth();
  await testContactTable();
}

runTests().catch(console.error);