import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54323';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testApplications() {
  console.log('🔍 Testing applications and interview marks...');
  
  try {
    // Test 1: Check kg_std applications
    console.log('\n📚 Test 1: Checking kg_std applications...');
    const { data: kgStdApps, error: kgStdError } = await supabase
      .from('kg_std_applications')
      .select('id, application_number, child_name, status')
      .limit(5);
    
    if (kgStdError) {
      console.error('❌ Error fetching kg_std applications:', kgStdError);
    } else {
      console.log('✅ KG STD applications:', kgStdApps);
    }
    
    // Test 2: Check plus_one applications
    console.log('\n🎓 Test 2: Checking plus_one applications...');
    const { data: plusOneApps, error: plusOneError } = await supabase
      .from('plus_one_applications')
      .select('id, application_number, student_name, status')
      .limit(5);
    
    if (plusOneError) {
      console.error('❌ Error fetching plus_one applications:', plusOneError);
    } else {
      console.log('✅ Plus One applications:', plusOneApps);
    }
    
    // Test 3: Check interview_marks table
    console.log('\n📊 Test 3: Checking interview_marks table...');
    const { data: interviewMarks, error: marksError } = await supabase
      .from('interview_marks')
      .select('*')
      .limit(10);
    
    if (marksError) {
      console.error('❌ Error fetching interview marks:', marksError);
    } else {
      console.log('✅ Interview marks:', interviewMarks);
    }
    
    // Test 4: Simulate the exact query from ApplicationDetail.tsx
    if (plusOneApps && plusOneApps.length > 0) {
      const testAppId = plusOneApps[0].id;
      console.log(`\n🧪 Test 4: Simulating ApplicationDetail query for plus_one app ${testAppId}...`);
      
      // Fetch subject templates for plus_one
      const { data: templates, error: templatesError } = await supabase
        .from('interview_subject_templates')
        .select('*')
        .eq('form_type', 'plus_one')
        .eq('is_active', true)
        .order('subject_name');
      
      console.log('📋 Subject templates result:', { templates, templatesError });
      
      // Fetch existing marks for this application
      const { data: existingMarks, error: marksError } = await supabase
        .from('interview_marks')
        .select('*')
        .eq('application_id', testAppId);
      
      console.log('📊 Existing marks result:', { existingMarks, marksError });
      
      // Combine templates with existing marks (same logic as ApplicationDetail)
      const subjects = templates?.map(template => {
        const existingMark = existingMarks?.find(mark => mark.subject_template_id === template.id);
        return {
          id: template.id,
          subject_name: template.subject_name,
          max_marks: template.max_marks,
          marks_obtained: existingMark?.marks_obtained || 0,
          remarks: existingMark?.remarks || ''
        };
      }) || [];
      
      console.log('✅ Final interview subjects (simulated):', subjects);
      
      if (subjects.length === 0) {
        console.log('⚠️  This would show "No interview subjects configured" message!');
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testApplications();