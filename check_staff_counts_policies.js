import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStaffCountsPolicies() {
  console.log('🔍 Checking staff_counts table policies...');
  console.log('=' .repeat(50));

  try {
    // Check if RLS is enabled
    const { data: rlsData, error: rlsError } = await supabase
      .from('pg_class')
      .select('relname, relrowsecurity')
      .eq('relname', 'staff_counts');
    
    if (rlsError) {
      console.error('❌ Error checking RLS status:', rlsError.message);
    } else {
      console.log('RLS Status:', rlsData);
    }

    // Check table permissions
    const { data: permData, error: permError } = await supabase
      .from('information_schema.role_table_grants')
      .select('grantee, table_name, privilege_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'staff_counts')
      .in('grantee', ['anon', 'authenticated']);
    
    if (permError) {
      console.error('❌ Error checking permissions:', permError.message);
    } else {
      console.log('\nTable Permissions:');
      console.log(permData);
    }

    // Try to check policies (this might fail with limited permissions)
    console.log('\nAttempting to check policies...');
    const { data: policyData, error: policyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'staff_counts');
    
    if (policyError) {
      console.log('⚠️ Cannot check policies directly (expected with anon key):', policyError.message);
    } else {
      console.log('Policies:', policyData);
    }

    // Test basic operations
    console.log('\nTesting basic operations...');
    
    // Test SELECT
    const { data: selectData, error: selectError } = await supabase
      .from('staff_counts')
      .select('*');
    
    console.log('SELECT test:', selectError ? `❌ ${selectError.message}` : `✅ Success (${selectData.length} rows)`);
    
    // Test INSERT
    const { error: insertError } = await supabase
      .from('staff_counts')
      .insert([{ teaching_staff: 1, security_staff: 1, professional_staff: 1, guides_staff: 1 }]);
    
    console.log('INSERT test:', insertError ? `❌ ${insertError.message}` : '✅ Success');
    
    // If insert succeeded, clean up
    if (!insertError) {
      await supabase.from('staff_counts').delete().eq('teaching_staff', 1);
      console.log('✅ Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkStaffCountsPolicies().then(() => {
  console.log('\n🏁 Policy check completed!');
}).catch(error => {
  console.error('💥 Check failed:', error);
});