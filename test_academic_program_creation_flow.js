import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Present' : 'Missing');
  process.exit(1);
}

// Use service role key for testing to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAcademicProgramCreation() {
  console.log('🧪 Testing Academic Program Creation Flow...');
  console.log('Supabase URL:', supabaseUrl);
  
  try {
    // Test 1: Check database connection
    console.log('\n1. Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('academic_programs')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError.message);
      return;
    }
    console.log('✅ Database connection successful');
    
    // Test 2: Check current table schema
    console.log('\n2. Checking academic_programs table schema...');
    const { data: existingPrograms, error: schemaError } = await supabase
      .from('academic_programs')
      .select('*')
      .limit(1);
    
    if (schemaError) {
      console.error('❌ Schema check failed:', schemaError.message);
      return;
    }
    
    if (existingPrograms && existingPrograms.length > 0) {
      console.log('✅ Table schema check - Sample record:');
      console.log(JSON.stringify(existingPrograms[0], null, 2));
    } else {
      console.log('✅ Table exists but no records found');
    }
    
    // Test 3: Try to insert a new academic program
    console.log('\n3. Testing academic program insertion...');
    const testProgram = {
      program_title: 'Test Computer Science Program',
      short_description: 'A comprehensive computer science program for testing purposes',
      full_description: 'A comprehensive computer science program designed to provide students with strong foundation in programming, algorithms, data structures, and software engineering principles.',
      category: 'high-school',
      is_active: true,
      display_order: 999,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Attempting to insert:', JSON.stringify(testProgram, null, 2));
    
    const { data: insertedProgram, error: insertError } = await supabase
      .from('academic_programs')
      .insert([testProgram])
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      console.error('Error details:', insertError);
      return;
    }
    
    console.log('✅ Academic program inserted successfully!');
    console.log('Inserted program:', JSON.stringify(insertedProgram, null, 2));
    
    const insertedId = insertedProgram[0].id;
    
    // Test 4: Verify the insertion by fetching the record
    console.log('\n4. Verifying insertion by fetching the record...');
    const { data: fetchedProgram, error: fetchError } = await supabase
      .from('academic_programs')
      .select('*')
      .eq('id', insertedId)
      .single();
    
    if (fetchError) {
      console.error('❌ Fetch verification failed:', fetchError.message);
      return;
    }
    
    console.log('✅ Record verification successful!');
    console.log('Fetched program:', JSON.stringify(fetchedProgram, null, 2));
    
    // Test 5: Clean up - delete the test record
    console.log('\n5. Cleaning up test record...');
    const { error: deleteError } = await supabase
      .from('academic_programs')
      .delete()
      .eq('id', insertedId);
    
    if (deleteError) {
      console.error('❌ Cleanup failed:', deleteError.message);
      console.log('⚠️ Test record may still exist in database');
    } else {
      console.log('✅ Test record cleaned up successfully');
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Academic program creation functionality is working correctly');
    
  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
  }
}

// Run the test
testAcademicProgramCreation().catch(console.error);