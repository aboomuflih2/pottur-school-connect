import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54323';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInterviewSubjectsSchema() {
  console.log('🔍 Checking interview_subjects table schema...');
  
  try {
    // Try to insert a test record to see what columns are expected
    console.log('\n📊 Testing interview_subjects table structure...');
    
    // First, get a real application ID and template ID for testing
    const { data: apps } = await supabase
      .from('plus_one_applications')
      .select('id')
      .limit(1);
    
    const { data: templates } = await supabase
      .from('interview_subject_templates')
      .select('id, subject_name')
      .eq('form_type', 'plus_one')
      .limit(1);
    
    if (apps && apps.length > 0 && templates && templates.length > 0) {
      const appId = apps[0].id;
      const templateId = templates[0].id;
      const subjectName = templates[0].subject_name;
      
      console.log(`📝 Testing with app_id: ${appId}, template_id: ${templateId}`);
      
      // Try different column combinations to see what works
      const testCombinations = [
        {
          name: 'marks_obtained + subject_template_id',
          data: {
            application_id: appId,
            application_type: 'plus_one',
            subject_template_id: templateId,
            marks_obtained: 20,
            remarks: 'Test remark'
          }
        },
        {
          name: 'marks + subject_template_id',
          data: {
            application_id: appId,
            application_type: 'plus_one',
            subject_template_id: templateId,
            marks: 20,
            remarks: 'Test remark'
          }
        },
        {
          name: 'marks + subject_name + max_marks',
          data: {
            application_id: appId,
            application_type: 'plus_one',
            subject_name: subjectName,
            marks: 20,
            max_marks: 25
          }
        }
      ];
      
      for (const combination of testCombinations) {
        console.log(`\n🧪 Testing combination: ${combination.name}`);
        
        const { data, error } = await supabase
          .from('interview_subjects')
          .insert(combination.data)
          .select();
        
        if (error) {
          console.log(`❌ Failed: ${error.message}`);
          if (error.details) {
            console.log(`   Details: ${error.details}`);
          }
        } else {
          console.log(`✅ Success! Inserted:`, data);
          
          // Clean up the test record
          await supabase
            .from('interview_subjects')
            .delete()
            .eq('application_id', appId);
          
          console.log('🧹 Test record cleaned up');
          break; // Found working combination
        }
      }
    }
    
    // Check existing records structure
    console.log('\n📋 Checking existing interview_subjects records...');
    const { data: existingRecords, error: existingError } = await supabase
      .from('interview_subjects')
      .select('*')
      .limit(5);
    
    if (existingError) {
      console.error('❌ Error fetching existing records:', existingError);
    } else {
      console.log('✅ Existing records:', existingRecords);
      if (existingRecords && existingRecords.length > 0) {
        console.log('📋 Available columns:', Object.keys(existingRecords[0]));
      } else {
        console.log('ℹ️  No existing records found');
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkInterviewSubjectsSchema();