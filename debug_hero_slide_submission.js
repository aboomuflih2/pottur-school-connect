import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugHeroSlideSubmission() {
  console.log('🔍 Starting Hero Slide Submission Debug...');
  console.log('=' .repeat(50));

  try {
    // Step 1: Check database connection
    console.log('\n1. Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('hero_slides')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      return;
    }
    console.log('✅ Database connection successful');

    // Step 2: Check current table structure
    console.log('\n2. Checking hero_slides table structure...');
    const { data: existingSlides, error: selectError } = await supabase
      .from('hero_slides')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('❌ Error reading hero_slides table:', selectError);
      return;
    }
    
    if (existingSlides && existingSlides.length > 0) {
      console.log('✅ Table structure (sample record):');
      console.log(JSON.stringify(existingSlides[0], null, 2));
    } else {
      console.log('⚠️  No existing slides found in table');
    }

    // Step 3: Test data insertion with the exact format from frontend
    console.log('\n3. Testing data insertion with frontend format...');
    
    const testSlideData = {
      // Old schema columns (required)
      title: 'Test Hero Slide',
      subtitle: 'This is a test subtitle',
      image_url: null,
      button_text: 'Learn More',
      button_url: '/test',
      order_index: 999,
      is_active: true,
      // New schema columns (for future compatibility)
      slide_title: 'Test Hero Slide',
      slide_subtitle: 'This is a test subtitle',
      background_image: null,
      button_link: '/test',
      display_order: 999
    };

    console.log('📝 Attempting to insert test data:');
    console.log(JSON.stringify(testSlideData, null, 2));

    const { data: insertData, error: insertError } = await supabase
      .from('hero_slides')
      .insert([testSlideData])
      .select();

    if (insertError) {
      console.error('❌ Insert operation failed:', insertError);
      console.error('Error details:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
    } else {
      console.log('✅ Insert operation successful!');
      console.log('Inserted data:', JSON.stringify(insertData, null, 2));
      
      // Clean up test data
      if (insertData && insertData.length > 0) {
        const testId = insertData[0].id;
        console.log(`\n🧹 Cleaning up test record (ID: ${testId})...`);
        
        const { error: deleteError } = await supabase
          .from('hero_slides')
          .delete()
          .eq('id', testId);
        
        if (deleteError) {
          console.error('❌ Failed to clean up test record:', deleteError);
        } else {
          console.log('✅ Test record cleaned up successfully');
        }
      }
    }

    // Step 4: Check RLS policies
    console.log('\n4. Checking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_table_policies', { table_name: 'hero_slides' })
      .catch(() => ({ data: null, error: 'RPC function not available' }));
    
    if (policyError) {
      console.log('⚠️  Could not check RLS policies directly:', policyError);
    } else if (policies) {
      console.log('📋 RLS Policies:', JSON.stringify(policies, null, 2));
    }

    // Step 5: Test authentication state
    console.log('\n5. Checking authentication state...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth check failed:', authError);
    } else if (user) {
      console.log('✅ User authenticated:', {
        id: user.id,
        email: user.email,
        role: user.role
      });
    } else {
      console.log('⚠️  No authenticated user (using anon key)');
    }

    // Step 6: Test with minimal data
    console.log('\n6. Testing with minimal required data...');
    
    const minimalData = {
      title: 'Minimal Test',
      subtitle: 'Minimal subtitle',
      order_index: 998,
      is_active: true
    };

    console.log('📝 Attempting minimal insert:');
    console.log(JSON.stringify(minimalData, null, 2));

    const { data: minimalInsert, error: minimalError } = await supabase
      .from('hero_slides')
      .insert([minimalData])
      .select();

    if (minimalError) {
      console.error('❌ Minimal insert failed:', minimalError);
    } else {
      console.log('✅ Minimal insert successful!');
      console.log('Inserted data:', JSON.stringify(minimalInsert, null, 2));
      
      // Clean up
      if (minimalInsert && minimalInsert.length > 0) {
        const testId = minimalInsert[0].id;
        await supabase.from('hero_slides').delete().eq('id', testId);
        console.log('✅ Minimal test record cleaned up');
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error during debug:', error);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Debug session completed');
}

// Run the debug function
debugHeroSlideSubmission().catch(console.error);