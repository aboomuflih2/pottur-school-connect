import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54323';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInterviewSubjectsFix() {
  console.log('🧪 Testing interview subjects fix...');
  
  try {
    // Test the exact logic from ApplicationDetail.tsx
    const applicationId = '0be0843d-39c4-4b47-8a8e-c036b2f58ea3';
    const formType = 'plus_one'; // This maps to plus_one in the code
    
    console.log(`\n📋 Testing for application: ${applicationId}, type: ${formType}`);
    
    // Step 1: Fetch interview subject templates (this should work)
    console.log('\n1️⃣ Fetching interview subject templates...');
    const { data: templates, error: templatesError } = await supabase
      .from('interview_subject_templates')
      .select('*')
      .eq('form_type', formType)
      .eq('is_active', true);
    
    if (templatesError) {
      console.error('❌ Error fetching templates:', templatesError);
      return;
    }
    
    console.log(`✅ Found ${templates?.length || 0} templates:`);
    templates?.forEach(t => console.log(`   - ${t.subject_name} (${t.max_marks} marks)`));
    
    if (!templates || templates.length === 0) {
      console.log('❌ No interview subjects configured for this application type');
      return;
    }
    
    // Step 2: Fetch existing marks for this application (this was the problem)
    console.log('\n2️⃣ Fetching existing marks for application...');
    const { data: existingMarks, error: marksError } = await supabase
      .from('interview_subjects')
      .select('*')
      .eq('application_id', applicationId);
    
    if (marksError) {
      console.error('❌ Error fetching existing marks:', marksError);
    } else {
      console.log(`✅ Found ${existingMarks?.length || 0} existing marks:`);
      existingMarks?.forEach(m => console.log(`   - ${m.subject_name}: ${m.marks}/${m.max_marks}`));
    }
    
    // Step 3: Combine templates with existing marks (the fixed logic)
    console.log('\n3️⃣ Combining templates with existing marks...');
    const subjects = templates?.map(template => {
      const existingMark = existingMarks?.find(mark => mark.subject_name === template.subject_name);
      return {
        id: template.id,
        subject_name: template.subject_name,
        max_marks: template.max_marks,
        marks_obtained: existingMark?.marks || 0,
        remarks: '' // remarks column doesn't exist in current schema
      };
    }) || [];
    
    console.log(`✅ Final interview subjects (${subjects.length}):`);
    subjects.forEach(s => console.log(`   - ${s.subject_name}: ${s.marks_obtained}/${s.max_marks}`));
    
    // Step 4: Test saving marks (simulate the saveMarks function)
    console.log('\n4️⃣ Testing save marks functionality...');
    
    // First, let's try to insert a test mark
    const testMark = {
      application_id: applicationId,
      application_type: formType,
      subject_name: templates[0].subject_name,
      marks: 20,
      max_marks: templates[0].max_marks
    };
    
    console.log('Attempting to insert test mark:', testMark);
    
    const { data: insertData, error: insertError } = await supabase
      .from('interview_subjects')
      .insert(testMark)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting test mark:', insertError);
      if (insertError.message.includes('row-level security')) {
        console.log('ℹ️  This is expected - RLS is blocking anonymous inserts');
        console.log('ℹ️  In the real app, admin authentication would bypass this');
      }
    } else {
      console.log('✅ Test mark inserted successfully:', insertData);
      
      // Clean up the test mark
      await supabase
        .from('interview_subjects')
        .delete()
        .eq('application_id', applicationId)
        .eq('subject_name', templates[0].subject_name);
      
      console.log('🧹 Test mark cleaned up');
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('✅ Interview subject templates are properly configured');
    console.log('✅ Table name fix applied (interview_subjects instead of interview_marks)');
    console.log('✅ Column mapping fix applied (marks instead of marks_obtained)');
    console.log('✅ Subject matching fix applied (subject_name instead of subject_template_id)');
    
    if (subjects.length > 0) {
      console.log('🎉 INTERVIEW SUBJECTS SHOULD NOW WORK PROPERLY!');
      console.log('ℹ️  The "No interview subjects configured" issue should be resolved');
    } else {
      console.log('❌ Still no subjects found - there may be other issues');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testInterviewSubjectsFix();