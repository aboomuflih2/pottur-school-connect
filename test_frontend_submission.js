import { createClient } from '@supabase/supabase-js';

// Use the same configuration as frontend
const supabaseUrl = 'http://127.0.0.1:54321';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

async function testFrontendSubmission() {
  console.log('🧪 Testing frontend hero slide submission...');
  console.log('🔗 Supabase URL:', supabaseUrl);
  console.log('🔑 Using anon key (first 20 chars):', anonKey.substring(0, 20) + '...');
  
  // Test data matching frontend format with required fields
  const testSlideData = {
    title: 'Frontend Test Slide', // Required NOT NULL field
    subtitle: 'Testing frontend submission to local DB',
    slide_title: 'Frontend Test Slide',
    slide_subtitle: 'Testing frontend submission to local DB',
    background_image: null,
    button_text: 'Test Action',
    button_link: '/test-page',
    display_order: 100,
    is_active: true
  };
  
  console.log('📝 Test slide data:', testSlideData);
  
  try {
    // Test connection first
    console.log('🔍 Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('hero_slides')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Connection test failed:', connectionError);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Attempt insert
    console.log('🚀 Attempting to insert hero slide...');
    const { data, error } = await supabase
      .from('hero_slides')
      .insert([testSlideData])
      .select();
    
    if (error) {
      console.error('❌ Insert failed:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Check if it's an RLS issue
      if (error.code === '42501') {
        console.log('🔒 This appears to be a Row Level Security (RLS) policy issue');
        console.log('💡 The anon role may not have INSERT permissions on hero_slides table');
      }
    } else {
      console.log('✅ Insert successful!', data);
      
      // Clean up test data
      const insertedId = data[0]?.id;
      if (insertedId) {
        await supabase
          .from('hero_slides')
          .delete()
          .eq('id', insertedId);
        console.log('🧹 Test data cleaned up');
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testFrontendSubmission();