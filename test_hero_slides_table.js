import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', supabaseKey ? 'Present' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testHeroSlidesTable() {
  console.log('Testing hero_slides table...');
  
  try {
    // Test 1: Check if table exists by querying its structure
    console.log('\n1. Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('hero_slides')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Table query error:', tableError);
      return;
    }
    
    console.log('✓ hero_slides table exists');
    console.log('Sample data structure:', tableInfo);
    
    // Test 2: Check table permissions
    console.log('\n2. Testing table permissions...');
    const { data: selectData, error: selectError } = await supabase
      .from('hero_slides')
      .select('*');
    
    if (selectError) {
      console.error('Select permission error:', selectError);
    } else {
      console.log('✓ Select permission works');
      console.log('Current records count:', selectData.length);
    }
    
    // Test 3: Test insert permission with CORRECT schema
    console.log('\n3. Testing insert permission with correct schema...');
    const testSlide = {
      title: 'Test Slide Title',
      subtitle: 'Test Slide Subtitle',
      image_url: 'https://example.com/test.jpg',
      button_text: 'Test Button',
      button_url: '/test',
      order_index: 999,
      is_active: true
    };
    
    console.log('Attempting to insert:', testSlide);
    
    const { data: insertData, error: insertError } = await supabase
      .from('hero_slides')
      .insert(testSlide)
      .select();
    
    if (insertError) {
      console.error('Insert permission error:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('✓ Insert permission works');
      console.log('Inserted test record:', insertData);
      
      // Clean up test record
      if (insertData && insertData[0]) {
        await supabase
          .from('hero_slides')
          .delete()
          .eq('id', insertData[0].id);
        console.log('✓ Test record cleaned up');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Test authentication
async function testAuth() {
  console.log('\nTesting authentication...');
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.log('No authenticated user (using anon key)');
  } else {
    console.log('Authenticated user:', user?.email);
  }
}

async function main() {
  console.log('=== Hero Slides Table Diagnostic ===');
  console.log('Supabase URL:', supabaseUrl);
  
  await testAuth();
  await testHeroSlidesTable();
}

main().catch(console.error);