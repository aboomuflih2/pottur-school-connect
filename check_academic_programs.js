import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use local Supabase instance
const supabaseUrl = 'http://localhost:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAcademicPrograms() {
  try {
    console.log('🔍 Checking academic programs in database...');
    
    const { data, error } = await supabase
      .from('academic_programs')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Also check for our test program specifically
    const { data: testProgram, error: testError } = await supabase
      .from('academic_programs')
      .select('*')
      .eq('program_title', 'Test Academic Program')
      .single();
    
    if (error) {
      console.error('❌ Error fetching academic programs:', error);
      return;
    }
    
    console.log(`📊 Found ${data.length} academic programs:`);
    
    if (data.length === 0) {
      console.log('📝 No academic programs found in database');
    } else {
      data.forEach((program, index) => {
        console.log(`\n${index + 1}. Program:`);
        console.log(`   ID: ${program.id}`);
        console.log(`   Title: ${program.program_title}`);
        console.log(`   Category: ${program.category}`);
        console.log(`   Short Description: ${program.short_description}`);
        console.log(`   Active: ${program.is_active}`);
        console.log(`   Created: ${program.created_at}`);
      });
    }
    
    // Check for our test program
    console.log('\n🔍 Checking for test program specifically...');
    if (testError && testError.code !== 'PGRST116') {
      console.error('❌ Error checking test program:', testError);
    } else if (testProgram) {
      console.log('✅ Test program "Test Academic Program" found!');
      console.log(`   ID: ${testProgram.id}`);
      console.log(`   Category: ${testProgram.category}`);
      console.log(`   Created: ${testProgram.created_at}`);
    } else {
      console.log('❌ Test program "Test Academic Program" not found');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAcademicPrograms();