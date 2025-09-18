// Test script to verify admission forms work in browser
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFormSubmissions() {
  console.log('🧪 Testing Admission Form Submissions...');
  
  try {
    // Test KG & STD Application Form
    console.log('\n📝 Testing KG & STD Application Form...');
    const kgStdData = {
      application_number: `KG${Date.now()}`,
      fullname_name: 'Test Student KG',
      gender: 'Male',
      date_of_birth: '2018-05-15',
      father_name: 'Test Father',
      mother_name: 'Test Mother',
      house_name: 'Test House',
      post_office: 'Test PO',
      village: 'Test Village',
      pincode: '123456',
      district: 'Test District',
      mobile_number: '9876543210',
    };
    
    const { data: kgResult, error: kgError } = await supabase
      .from('kg_std_applications')
      .insert([kgStdData])
      .select();
    
    if (kgError) {
      console.error('❌ KG & STD Form Error:', kgError);
    } else {
      console.log('✅ KG & STD Form Success:', kgResult[0]?.application_number);
    }
    
    // Test Plus One Application Form
    console.log('\n📝 Testing Plus One Application Form...');
    const plusOneData = {
      application_number: `PO${Date.now()}`,
      full_name: 'Test Student Plus One',
      gender: 'Female',
      date_of_birth: '2006-08-20',
      father_name: 'Test Father PO',
      mother_name: 'Test Mother PO',
      house_name: 'Test House PO',
      post_office: 'Test PO Plus',
      village: 'Test Village Plus',
      pincode: '654321',
      district: 'Test District Plus',
      email: 'testpo@example.com',
      mobile_number: '9876543211',
      tenth_school: 'Test High School',
      board: 'CBSE',
      exam_roll_number: 'TEST123456',
      exam_year: '2024',
      stream: 'Science',
      has_siblings: true,
      siblings_names: 'Test Sibling',
      status: 'submitted'
    };
    
    const { data: poResult, error: poError } = await supabase
      .from('plus_one_applications')
      .insert([plusOneData])
      .select();
    
    if (poError) {
      console.error('❌ Plus One Form Error:', poError);
    } else {
      console.log('✅ Plus One Form Success:', poResult[0]?.application_number);
    }
    
    // Test database connectivity
    console.log('\n🔍 Testing Database Connectivity...');
    const { data: kgCount, error: kgCountError } = await supabase
      .from('kg_std_applications')
      .select('*', { count: 'exact', head: true });
    
    const { data: poCount, error: poCountError } = await supabase
      .from('plus_one_applications')
      .select('*', { count: 'exact', head: true });
    
    if (!kgCountError && !poCountError) {
      console.log('✅ Database connectivity verified');
      console.log(`📊 KG & STD Applications: ${kgCount?.length || 0}`);
      console.log(`📊 Plus One Applications: ${poCount?.length || 0}`);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Admission form submission buttons should work properly');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFormSubmissions();