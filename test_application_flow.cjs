const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testApplicationFlow() {
  try {
    console.log('=== Testing Application Flow ===');
    
    // 1. Verify interview subject templates
    console.log('\n1. Checking interview subject templates...');
    const { data: templates, error: templatesError } = await supabase
      .from('interview_subject_templates')
      .select('*')
      .eq('is_active', true)
      .order('form_type, display_order');
    
    if (templatesError) {
      console.error('Templates error:', templatesError);
      return;
    }
    
    console.log(`Found ${templates?.length || 0} active templates:`);
    templates?.forEach(t => {
      console.log(`  - ${t.form_type}: ${t.subject_name} (${t.max_marks} marks)`);
    });
    
    // 2. Check existing applications
    console.log('\n2. Checking existing applications...');
    const { data: applications, error: appsError } = await supabase
      .from('plus_one_applications')
      .select('id, application_number, full_name, status')
      .in('status', ['shortlisted_for_interview', 'interview_complete'])
      .limit(3);
    
    if (appsError) {
      console.error('Applications error:', appsError);
    } else {
      console.log(`Found ${applications?.length || 0} applications with interview status:`);
      applications?.forEach(app => {
        console.log(`  - ${app.application_number}: ${app.full_name} (${app.status})`);
      });
    }
    
    // 3. Create a test application if none exist with interview status
    if (!applications || applications.length === 0) {
      console.log('\n3. Creating test application...');
      const testApp = {
        application_number: 'TEST001',
        full_name: 'Test Student',
        mobile_number: '9876543210',
        email: 'test@example.com',
        date_of_birth: '2005-01-01',
        gender: 'male',
        father_name: 'Test Father',
        mother_name: 'Test Mother',
        house_name: 'Test House',
        village: 'Test Village',
        district: 'Test District',
        pincode: '123456',
        post_office: 'Test PO',
        board: 'CBSE',
        exam_roll_number: 'TEST123',
        exam_year: '2023',
        stream: 'Science',
        tenth_school: 'Test School',
        status: 'shortlisted_for_interview'
      };
      
      const { data: newApp, error: createError } = await supabase
        .from('plus_one_applications')
        .insert([testApp])
        .select()
        .single();
      
      if (createError) {
        console.error('Create application error:', createError);
      } else {
        console.log(`Created test application: ${newApp.id} (${newApp.application_number})`);
        
        // Test fetching interview subjects for this application
        console.log('\n4. Testing interview subjects fetch...');
        const { data: subjectTemplates, error: subjectError } = await supabase
          .from('interview_subject_templates')
          .select('*')
          .eq('form_type', 'plus_one')
          .eq('is_active', true)
          .order('display_order');
          
        if (subjectError) {
          console.error('Subject templates error:', subjectError);
        } else {
          console.log(`Found ${subjectTemplates?.length || 0} subject templates for plus_one:`);
          subjectTemplates?.forEach(template => {
            console.log(`  - ${template.subject_name} (max: ${template.max_marks})`);
          });
        }
      }
    }
    
    console.log('\n=== Test completed successfully ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testApplicationFlow();