import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54323';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableSchemas() {
  console.log('🔍 Checking actual table schemas...');
  
  try {
    // Check kg_std_applications table structure
    console.log('\n📚 Checking kg_std_applications table...');
    const { data: kgStdApps, error: kgStdError } = await supabase
      .from('kg_std_applications')
      .select('*')
      .limit(1);
    
    if (kgStdError) {
      console.error('❌ Error with kg_std_applications:', kgStdError);
    } else {
      console.log('✅ kg_std_applications sample:', kgStdApps);
      if (kgStdApps && kgStdApps.length > 0) {
        console.log('📋 Available columns:', Object.keys(kgStdApps[0]));
      }
    }
    
    // Check plus_one_applications table structure
    console.log('\n🎓 Checking plus_one_applications table...');
    const { data: plusOneApps, error: plusOneError } = await supabase
      .from('plus_one_applications')
      .select('*')
      .limit(1);
    
    if (plusOneError) {
      console.error('❌ Error with plus_one_applications:', plusOneError);
    } else {
      console.log('✅ plus_one_applications sample:', plusOneApps);
      if (plusOneApps && plusOneApps.length > 0) {
        console.log('📋 Available columns:', Object.keys(plusOneApps[0]));
      }
    }
    
    // Check interview_subjects table (not interview_marks)
    console.log('\n📊 Checking interview_subjects table...');
    const { data: interviewSubjects, error: subjectsError } = await supabase
      .from('interview_subjects')
      .select('*')
      .limit(5);
    
    if (subjectsError) {
      console.error('❌ Error with interview_subjects:', subjectsError);
    } else {
      console.log('✅ interview_subjects sample:', interviewSubjects);
      if (interviewSubjects && interviewSubjects.length > 0) {
        console.log('📋 Available columns:', Object.keys(interviewSubjects[0]));
      }
    }
    
    // List all available tables
    console.log('\n📋 Checking available tables...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');
    
    if (tablesError) {
      console.log('ℹ️  Could not get table list via RPC, trying direct queries...');
      
      // Try some common table names
      const tablesToTry = [
        'applications',
        'kg_applications', 
        'plus_one_applications',
        'interview_marks',
        'interview_subjects',
        'interview_subject_templates'
      ];
      
      for (const tableName of tablesToTry) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!error) {
            console.log(`✅ Table '${tableName}' exists`);
            if (data && data.length > 0) {
              console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
            }
          }
        } catch (e) {
          // Table doesn't exist, skip
        }
      }
    } else {
      console.log('✅ Available tables:', tables);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkTableSchemas();