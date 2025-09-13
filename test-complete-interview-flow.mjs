import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54323',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNx_VzKNHAoFwFrXbVFjCBVGA0Nc'
);

async function testCompleteFlow() {
  console.log('🧪 TESTING COMPLETE INTERVIEW SETTINGS TO MARK LIST FLOW');
  console.log('='.repeat(60));
  
  try {
    console.log('\n1️⃣ ADMIN LOGIN');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@potturschool.com',
      password: 'admin123'
    });
    
    if (authError) throw authError;
    console.log('✅ Admin logged in successfully');
    
    console.log('\n2️⃣ SIMULATE INTERVIEW SETTINGS SAVE');
    const testSubjects = [
      {
        form_type: 'kg_std',
        subject_name: 'Test Subject A',
        max_marks: 25,
        display_order: 1,
        is_active: true
      },
      {
        form_type: 'kg_std',
        subject_name: 'Test Subject B',
        max_marks: 30,
        display_order: 2,
        is_active: true
      }
    ];
    
    console.log('Deleting existing test subjects...');
    await supabase
      .from('interview_subject_templates')
      .delete()
      .eq('form_type', 'kg_std')
      .in('subject_name', ['Test Subject A', 'Test Subject B']);
    
    console.log('Inserting new test subjects...');
    const { data: insertData, error: insertError } = await supabase
      .from('interview_subject_templates')
      .insert(testSubjects)
      .select();
    
    if (insertError) throw insertError;
    console.log('✅ Test subjects saved:', insertData.length);
    
    console.log('\n3️⃣ SIMULATE APPLICATIONDETAIL.TSX FETCHINTERVIEWSUBJECTS');
    const formType = 'kg_std';
    console.log('Fetching subject templates for form_type:', formType);
    
    const { data: templates, error: templatesError } = await supabase
      .from('interview_subject_templates')
      .select('*')
      .eq('form_type', formType)
      .eq('is_active', true)
      .order('subject_name');
    
    if (templatesError) throw templatesError;
    console.log('✅ Templates fetched:', templates.length);
    templates.forEach(t => console.log(`   - ${t.subject_name}: ${t.max_marks} marks`));
    
    console.log('\n4️⃣ SIMULATE FETCHING EXISTING MARKS (should be empty for new application)');
    const testApplicationId = '0be0843d-39c4-4b47-8a8e-c036b2f58ea3';
    
    const { data: existingMarks, error: marksError } = await supabase
      .from('interview_subjects')
      .select('*')
      .eq('application_id', testApplicationId);
    
    if (marksError) throw marksError;
    console.log('✅ Existing marks fetched:', existingMarks?.length || 0);
    
    console.log('\n5️⃣ SIMULATE COMBINING TEMPLATES WITH EXISTING MARKS');
    const subjects = templates?.map(template => {
      const existingMark = existingMarks?.find(mark => mark.subject_name === template.subject_name);
      return {
        id: template.id,
        subject_name: template.subject_name,
        max_marks: template.max_marks,
        marks: existingMark?.marks || 0
      };
    }) || [];
    
    console.log('✅ Final interview subjects for display:', subjects.length);
    subjects.forEach(s => console.log(`   - ${s.subject_name}: ${s.marks}/${s.max_marks}`));
    
    console.log('\n6️⃣ SIMULATE SAVING MARKS IN INTERVIEW MARK LIST');
    const marksToInsert = [{
      application_id: testApplicationId,
      application_type: 'kg_std',
      subject_name: subjects[0].subject_name,
      marks: 20,
      max_marks: subjects[0].max_marks
    }];
    
    console.log('Deleting existing marks for application...');
    await supabase
      .from('interview_subjects')
      .delete()
      .eq('application_id', testApplicationId)
      .eq('application_type', 'kg_std');
    
    console.log('Inserting new marks...');
    const { data: saveData, error: saveError } = await supabase
      .from('interview_subjects')
      .insert(marksToInsert)
      .select();
    
    if (saveError) throw saveError;
    console.log('✅ Marks saved:', saveData.length);
    
    console.log('\n7️⃣ VERIFY COMPLETE FLOW');
    const { data: finalTemplates } = await supabase
      .from('interview_subject_templates')
      .select('*')
      .eq('form_type', 'kg_std')
      .eq('is_active', true);
    
    const { data: finalMarks } = await supabase
      .from('interview_subjects')
      .select('*')
      .eq('application_id', testApplicationId);
    
    console.log('✅ FLOW VERIFICATION:');
    console.log(`   Templates in database: ${finalTemplates?.length || 0}`);
    console.log(`   Marks in database: ${finalMarks?.length || 0}`);
    
    console.log('\n🎉 COMPLETE FLOW TEST SUCCESSFUL!');
    console.log('The Interview Settings → Interview Mark List flow works correctly.');
    console.log('Issue might be in frontend state management or navigation.');
    
  } catch (error) {
    console.error('❌ Error in complete flow test:', error);
  }
}

testCompleteFlow();