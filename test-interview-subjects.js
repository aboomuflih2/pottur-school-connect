import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54323';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInterviewSubjects() {
  console.log('🔍 Testing interview subjects functionality...');
  console.log('📡 Supabase URL:', supabaseUrl);
  
  try {
    // Test 1: Check if interview_subject_templates table exists and has data
    console.log('\n📋 Test 1: Fetching all interview subject templates...');
    const { data: allTemplates, error: allError } = await supabase
      .from('interview_subject_templates')
      .select('*')
      .order('form_type, subject_name');
    
    if (allError) {
      console.error('❌ Error fetching all templates:', allError);
      return;
    }
    
    console.log('✅ All templates:', allTemplates);
    
    // Test 2: Fetch kg_std subjects specifically
    console.log('\n📚 Test 2: Fetching kg_std subjects...');
    const { data: kgStdTemplates, error: kgStdError } = await supabase
      .from('interview_subject_templates')
      .select('*')
      .eq('form_type', 'kg_std')
      .eq('is_active', true)
      .order('subject_name');
    
    if (kgStdError) {
      console.error('❌ Error fetching kg_std templates:', kgStdError);
    } else {
      console.log('✅ KG STD templates:', kgStdTemplates);
    }
    
    // Test 3: Fetch plus_one subjects specifically
    console.log('\n🎓 Test 3: Fetching plus_one subjects...');
    const { data: plusOneTemplates, error: plusOneError } = await supabase
      .from('interview_subject_templates')
      .select('*')
      .eq('form_type', 'plus_one')
      .eq('is_active', true)
      .order('subject_name');
    
    if (plusOneError) {
      console.error('❌ Error fetching plus_one templates:', plusOneError);
    } else {
      console.log('✅ Plus One templates:', plusOneTemplates);
    }
    
    // Test 4: Check table permissions
    console.log('\n🔐 Test 4: Testing table permissions...');
    const { data: permissionTest, error: permissionError } = await supabase
      .from('interview_subject_templates')
      .select('count')
      .limit(1);
    
    if (permissionError) {
      console.error('❌ Permission error:', permissionError);
    } else {
      console.log('✅ Table permissions OK');
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`- Total templates: ${allTemplates?.length || 0}`);
    console.log(`- KG STD templates: ${kgStdTemplates?.length || 0}`);
    console.log(`- Plus One templates: ${plusOneTemplates?.length || 0}`);
    
    if ((kgStdTemplates?.length || 0) === 0 && (plusOneTemplates?.length || 0) === 0) {
      console.log('\n⚠️  No interview subjects found! This explains the "No interview subjects configured" message.');
    } else {
      console.log('\n✅ Interview subjects are properly configured in the database.');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testInterviewSubjects();