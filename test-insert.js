import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('🧪 Testing simple inserts...');
  
  // Test admission_forms
  console.log('\n📝 Testing admission_forms:');
  try {
    const { data, error } = await supabase
      .from('admission_forms')
      .insert({
        form_type: 'kg_std',
        is_active: true
      })
      .select();
    
    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   Details: ${JSON.stringify(error, null, 2)}`);
    } else {
      console.log(`   ✅ Success: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (err) {
    console.log(`   ❌ Exception: ${err.message}`);
  }
  
  // Test kg_std_applications
  console.log('\n📝 Testing kg_std_applications:');
  try {
    const { data, error } = await supabase
      .from('kg_std_applications')
      .insert({
        child_name: 'Test Child',
        status: 'submitted'
      })
      .select();
    
    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   Details: ${JSON.stringify(error, null, 2)}`);
    } else {
      console.log(`   ✅ Success: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (err) {
    console.log(`   ❌ Exception: ${err.message}`);
  }
  
  // Test interview_subject_templates
  console.log('\n📝 Testing interview_subject_templates:');
  try {
    const { data, error } = await supabase
      .from('interview_subject_templates')
      .insert({
        form_type: 'kg_std',
        subject_name: 'Test Subject',
        max_marks: 100
      })
      .select();
    
    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   Details: ${JSON.stringify(error, null, 2)}`);
    } else {
      console.log(`   ✅ Success: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (err) {
    console.log(`   ❌ Exception: ${err.message}`);
  }
}

testInsert().catch(console.error);