// Test script to debug admission form submission
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'http://127.0.0.1:54323';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testKGStdFormSubmission() {
  console.log('Testing KG & STD Application Form Submission...');
  
  const testData = {
    application_number: 'TEST-KG-' + Date.now(),
    fullname_name: 'Test Student',
    date_of_birth: '2015-01-01',
    gender: 'Male',
    father_name: 'Test Father',
    mother_name: 'Test Mother',
    mobile_number: '9876543210',
    email: 'test@example.com',
    house_name: 'Test House',
    village: 'Test Village',
    post_office: 'Test PO',
    pincode: '123456',
    district: 'Test District',
    previous_school: 'Test School'
  };

  try {
    const { data, error } = await supabase
      .from('kg_std_applications')
      .insert([testData])
      .select();

    if (error) {
      console.error('❌ KG & STD Form Submission Error:', error);
      return false;
    }

    console.log('✅ KG & STD Form Submission Success:', data);
    return true;
  } catch (err) {
    console.error('❌ KG & STD Form Submission Exception:', err);
    return false;
  }
}

async function testPlusOneFormSubmission() {
  console.log('Testing Plus One Application Form Submission...');
  
  const testData = {
    application_number: 'TEST-PLUS-' + Date.now(),
    full_name: 'Test Student Plus',
    date_of_birth: '2005-01-01',
    gender: 'Female',
    father_name: 'Test Father Plus',
    mother_name: 'Test Mother Plus',
    mobile_number: '9876543211',
    email: 'testplus@example.com',
    house_name: 'Test House Plus',
    village: 'Test Village Plus',
    post_office: 'Test PO Plus',
    pincode: '654321',
    district: 'Test District Plus',
    tenth_school: 'Test School Plus',
    board: 'CBSE',
    exam_roll_number: '12345',
    exam_year: '2023',
    stream: 'Science',
    status: 'pending'
  };

  try {
    const { data, error } = await supabase
      .from('plus_one_applications')
      .insert([testData])
      .select();

    if (error) {
      console.error('❌ Plus One Form Submission Error:', error);
      return false;
    }

    console.log('✅ Plus One Form Submission Success:', data);
    return true;
  } catch (err) {
    console.error('❌ Plus One Form Submission Exception:', err);
    return false;
  }
}

async function testFormSubmissions() {
  console.log('🚀 Starting Admission Form Submission Tests...');
  
  const kgResult = await testKGStdFormSubmission();
  const plusResult = await testPlusOneFormSubmission();
  
  console.log('\n📊 Test Results:');
  console.log(`KG & STD Form: ${kgResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Plus One Form: ${plusResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (kgResult && plusResult) {
    console.log('\n🎉 All form submissions working correctly!');
  } else {
    console.log('\n⚠️ Some form submissions have issues that need to be fixed.');
  }
}

// Run the tests
testFormSubmissions().catch(console.error);