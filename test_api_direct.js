import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use local Supabase instance
const supabaseUrl = 'http://localhost:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectAPI() {
  try {
    console.log('🧪 Testing direct API call to create academic program...');
    
    // First, let's authenticate as admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@potturschool.com',
      password: 'admin123'
    });
    
    if (authError) {
      console.error('❌ Authentication failed:', authError);
      return;
    }
    
    console.log('✅ Authentication successful');
    console.log('User ID:', authData.user.id);
    
    // Now try to create an academic program
    const programData = {
      program_title: 'API Test Program',
      category: 'primary',
      short_description: 'This is a test program created via direct API call',
      full_description: 'Full description for the API test program',
      is_active: true
    };
    
    console.log('📝 Creating academic program with data:', programData);
    
    const { data: insertData, error: insertError } = await supabase
      .from('academic_programs')
      .insert([programData])
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      console.error('Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
    } else {
      console.log('✅ Academic program created successfully!');
      console.log('Created program:', insertData[0]);
    }
    
    // Check total count
    const { count, error: countError } = await supabase
      .from('academic_programs')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`📊 Total academic programs in database: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDirectAPI();