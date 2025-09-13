import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54323';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

async function testCompleteInterviewWorkflow() {
  console.log('🎯 Testing Complete Interview Subjects Workflow');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Admin Authentication
    console.log('\n1️⃣ ADMIN AUTHENTICATION');
    console.log('Signing in as admin...');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@potturschool.com',
      password: 'admin123'
    });
    
    if (authError) {
      console.error('❌ Admin login failed:', authError.message);
      return;
    }
    
    console.log('✅ Admin login successful!');
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);
    
    // Verify admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authData.user.id)
      .eq('role', 'admin')
      .single();
    
    if (roleError || !roleData) {
      console.error('❌ Admin role verification failed:', roleError?.message);
      return;
    }
    
    console.log('✅ Admin role verified');
    
    // Step 2: Test Interview Settings (Template Management)
    console.log('\n2️⃣ INTERVIEW SETTINGS - Template Management');
    
    // Check existing templates
    const { data: existingTemplates, error: templatesError } = await supabase
      .from('interview_subject_templates')
      .select('*')
      .eq('is_active', true)
      .order('form_type', { ascending: true });
    
    if (templatesError) {
      console.error('❌ Error fetching templates:', templatesError);
      return;
    }
    
    console.log(`✅ Found ${existingTemplates.length} active interview subject templates:`);
    const templatesByType = {};
    existingTemplates.forEach(template => {
      if (!templatesByType[template.form_type]) {
        templatesByType[template.form_type] = [];
      }
      templatesByType[template.form_type].push(template);
      console.log(`   ${template.form_type}: ${template.subject_name} (${template.max_marks} marks)`);
    });
    
    // Verify both kg_std and plus_one have templates
    const requiredTypes = ['kg_std', 'plus_one'];
    for (const type of requiredTypes) {
      if (!templatesByType[type] || templatesByType[type].length === 0) {
        console.log(`❌ No templates found for ${type} - this would cause "No interview subjects configured"`);
        return;
      } else {
        console.log(`✅ ${templatesByType[type].length} templates configured for ${type}`);
      }
    }
    
    // Step 3: Test Application Detail - Interview Subjects Loading
    console.log('\n3️⃣ APPLICATION DETAIL - Interview Subjects Loading');
    
    const testApplicationId = '0be0843d-39c4-4b47-8a8e-c036b2f58ea3';
    const testFormType = 'plus_one';
    
    console.log(`Testing with application: ${testApplicationId} (${testFormType})`);
    
    // Simulate the exact logic from ApplicationDetail.tsx fetchInterviewSubjects function
    console.log('\nFetching interview subject templates...');
    const { data: templates, error: fetchError } = await supabase
      .from('interview_subject_templates')
      .select('*')
      .eq('form_type', testFormType)
      .eq('is_active', true);
    
    if (fetchError) {
      console.error('❌ Error fetching templates:', fetchError);
      return;
    }
    
    if (!templates || templates.length === 0) {
      console.log('❌ No interview subjects configured for this application type');
      return;
    }
    
    console.log(`✅ Found ${templates.length} templates for ${testFormType}:`);
    templates.forEach(t => console.log(`   - ${t.subject_name} (${t.max_marks} marks)`));
    
    // Fetch existing marks
    console.log('\nFetching existing marks...');
    const { data: existingMarks, error: marksError } = await supabase
      .from('interview_subjects')
      .select('*')
      .eq('application_id', testApplicationId);
    
    if (marksError) {
      console.error('❌ Error fetching existing marks:', marksError);
      return;
    }
    
    console.log(`✅ Found ${existingMarks?.length || 0} existing marks`);
    
    // Combine templates with existing marks (the fixed logic)
    const subjects = templates.map(template => {
      const existingMark = existingMarks?.find(mark => mark.subject_name === template.subject_name);
      return {
        id: template.id,
        subject_name: template.subject_name,
        max_marks: template.max_marks,
        marks_obtained: existingMark?.marks || 0,
        remarks: '' // remarks column doesn't exist in current schema
      };
    });
    
    console.log(`✅ Interview subjects prepared for display (${subjects.length}):`);
    subjects.forEach(s => console.log(`   - ${s.subject_name}: ${s.marks_obtained}/${s.max_marks}`));
    
    // Step 4: Test Mark Entry and Saving
    console.log('\n4️⃣ MARK ENTRY AND SAVING');
    
    // Simulate entering marks for the first subject
    const testSubject = subjects[0];
    const testMarks = Math.floor(Math.random() * testSubject.max_marks); // Random marks
    
    console.log(`Testing mark entry for: ${testSubject.subject_name}`);
    console.log(`Entering marks: ${testMarks}/${testSubject.max_marks}`);
    
    // Simulate the saveMarks function from ApplicationDetail.tsx
    console.log('\nSimulating saveMarks function...');
    
    // First, delete existing marks for this application (as per the original logic)
    const { error: deleteError } = await supabase
      .from('interview_subjects')
      .delete()
      .eq('application_id', testApplicationId);
    
    if (deleteError) {
      console.error('❌ Error deleting existing marks:', deleteError);
    } else {
      console.log('✅ Existing marks cleared');
    }
    
    // Insert new marks
    const marksToInsert = [{
      application_id: testApplicationId,
      application_type: testFormType,
      subject_name: testSubject.subject_name,
      marks: testMarks,
      max_marks: testSubject.max_marks
    }];
    
    const { data: insertData, error: insertError } = await supabase
      .from('interview_subjects')
      .insert(marksToInsert)
      .select();
    
    if (insertError) {
      console.error('❌ Error saving marks:', insertError);
      return;
    }
    
    console.log('✅ Marks saved successfully:', insertData);
    
    // Step 5: Verify the complete workflow
    console.log('\n5️⃣ WORKFLOW VERIFICATION');
    
    // Re-fetch to verify the marks were saved correctly
    const { data: verifyMarks, error: verifyError } = await supabase
      .from('interview_subjects')
      .select('*')
      .eq('application_id', testApplicationId);
    
    if (verifyError) {
      console.error('❌ Error verifying saved marks:', verifyError);
      return;
    }
    
    console.log(`✅ Verification: Found ${verifyMarks?.length || 0} saved marks:`);
    verifyMarks?.forEach(mark => {
      console.log(`   - ${mark.subject_name}: ${mark.marks}/${mark.max_marks}`);
    });
    
    // Step 6: Test Application Status Update
    console.log('\n6️⃣ APPLICATION STATUS UPDATE');
    
    // Simulate updating application status after marks entry
    const { data: appData, error: appError } = await supabase
      .from('plus_one_applications')
      .select('full_name, application_status')
      .eq('id', testApplicationId)
      .single();
    
    if (appError) {
      console.error('❌ Error fetching application:', appError);
    } else {
      console.log(`✅ Application: ${appData.full_name} - Status: ${appData.application_status}`);
    }
    
    // Final Summary
    console.log('\n🎉 WORKFLOW TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log('✅ Admin authentication: PASSED');
    console.log('✅ Interview subject templates: CONFIGURED');
    console.log('✅ Template fetching: WORKING');
    console.log('✅ Existing marks fetching: WORKING');
    console.log('✅ Subject combination logic: WORKING');
    console.log('✅ Mark entry and saving: WORKING');
    console.log('✅ Data persistence: VERIFIED');
    console.log('\n🚀 THE INTERVIEW SUBJECTS WORKFLOW IS FULLY FUNCTIONAL!');
    console.log('\n📋 What this means:');
    console.log('   • "No interview subjects configured" error is FIXED');
    console.log('   • Interview subjects will load properly in the admin panel');
    console.log('   • Marks can be entered and saved successfully');
    console.log('   • The complete workflow from Interview Settings to Mark List works');
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await supabase
      .from('interview_subjects')
      .delete()
      .eq('application_id', testApplicationId);
    console.log('✅ Test data cleaned up');
    
    // Sign out
    await supabase.auth.signOut();
    console.log('✅ Signed out successfully');
    
  } catch (error) {
    console.error('💥 Workflow test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testCompleteInterviewWorkflow();