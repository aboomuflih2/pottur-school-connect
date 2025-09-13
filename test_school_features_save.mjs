import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testSchoolFeaturesSave() {
  console.log('🔍 Testing School Features Manager Save Functionality...');
  console.log('=' .repeat(60));

  try {
    // 1. Check if school_features table exists and its schema
    console.log('\n1. Checking school_features table schema...');
    const { data: tableInfo, error: tableError } = await adminSupabase
      .from('school_features')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accessing school_features table:', tableError.message);
      return;
    }
    console.log('✅ school_features table is accessible');

    // 2. Test adding a new feature
    console.log('\n2. Testing add new feature...');
    const testFeature = {
      feature_title: 'Test Feature ' + Date.now(),
      feature_description: 'This is a test feature for validation',
      icon_name: 'GraduationCap',
      display_order: 999,
      is_active: true
    };

    const { data: insertData, error: insertError } = await adminSupabase
      .from('school_features')
      .insert([testFeature])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error inserting feature:', insertError.message);
      return;
    }
    console.log('✅ Feature inserted successfully:', insertData.feature_title);
    const testFeatureId = insertData.id;

    // 3. Test updating the feature
    console.log('\n3. Testing update feature...');
    const updatedTitle = 'Updated Test Feature ' + Date.now();
    const { error: updateError } = await adminSupabase
      .from('school_features')
      .update({
        feature_title: updatedTitle,
        feature_description: 'Updated description for testing'
      })
      .eq('id', testFeatureId);

    if (updateError) {
      console.error('❌ Error updating feature:', updateError.message);
      return;
    }
    console.log('✅ Feature updated successfully');

    // 4. Test toggling active status
    console.log('\n4. Testing toggle active status...');
    const { error: toggleError } = await adminSupabase
      .from('school_features')
      .update({ is_active: false })
      .eq('id', testFeatureId);

    if (toggleError) {
      console.error('❌ Error toggling feature status:', toggleError.message);
      return;
    }
    console.log('✅ Feature status toggled successfully');

    // 5. Verify the changes
    console.log('\n5. Verifying changes...');
    const { data: verifyData, error: verifyError } = await adminSupabase
      .from('school_features')
      .select('*')
      .eq('id', testFeatureId)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying changes:', verifyError.message);
      return;
    }

    console.log('✅ Verification successful:');
    console.log(`  - Title: ${verifyData.feature_title}`);
    console.log(`  - Description: ${verifyData.feature_description}`);
    console.log(`  - Active: ${verifyData.is_active}`);
    console.log(`  - Icon: ${verifyData.icon_name}`);

    // 6. Test delete functionality
    console.log('\n6. Testing delete feature...');
    const { error: deleteError } = await adminSupabase
      .from('school_features')
      .delete()
      .eq('id', testFeatureId);

    if (deleteError) {
      console.error('❌ Error deleting feature:', deleteError.message);
      return;
    }
    console.log('✅ Feature deleted successfully');

    // 7. Check existing features count
    console.log('\n7. Checking existing features...');
    const { data: allFeatures, error: countError } = await adminSupabase
      .from('school_features')
      .select('id, feature_title, is_active')
      .order('display_order');

    if (countError) {
      console.error('❌ Error fetching features:', countError.message);
      return;
    }

    console.log(`✅ Found ${allFeatures.length} existing features:`);
    allFeatures.forEach((feature, index) => {
      console.log(`  ${index + 1}. ${feature.feature_title} (${feature.is_active ? 'Active' : 'Inactive'})`);
    });

    console.log('\n🎉 All School Features Manager tests passed!');
    console.log('✅ The admin client is working properly for CRUD operations');

  } catch (error) {
    console.error('💥 Unexpected error during testing:', error);
  }
}

testSchoolFeaturesSave();