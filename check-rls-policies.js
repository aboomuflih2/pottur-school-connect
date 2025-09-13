import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS policies for school_stats table...');
  
  try {
    // Check if RLS is enabled
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity
          FROM pg_tables 
          WHERE tablename = 'school_stats' AND schemaname = 'public';
        `
      });
    
    if (tableError) {
      console.error('❌ Error checking table info:', tableError.message);
      return;
    }
    
    console.log('📋 Table info:', tableInfo);
    
    // Check existing policies
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            policyname,
            cmd,
            roles,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = 'school_stats' AND schemaname = 'public'
          ORDER BY policyname;
        `
      });
    
    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError.message);
      return;
    }
    
    console.log('\n🛡️ Current RLS policies:');
    if (policies && policies.length > 0) {
      policies.forEach((policy, index) => {
        console.log(`\n${index + 1}. Policy: ${policy.policyname}`);
        console.log(`   Command: ${policy.cmd}`);
        console.log(`   Roles: ${policy.roles}`);
        console.log(`   Condition: ${policy.qual || 'None'}`);
        console.log(`   With Check: ${policy.with_check || 'None'}`);
      });
    } else {
      console.log('   No policies found!');
    }
    
    // Check table permissions
    const { data: permissions, error: permError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            grantee,
            table_name,
            privilege_type
          FROM information_schema.role_table_grants 
          WHERE table_schema = 'public' 
            AND table_name = 'school_stats'
            AND grantee IN ('anon', 'authenticated')
          ORDER BY grantee, privilege_type;
        `
      });
    
    if (permError) {
      console.error('❌ Error checking permissions:', permError.message);
      return;
    }
    
    console.log('\n🔑 Table permissions:');
    if (permissions && permissions.length > 0) {
      permissions.forEach((perm, index) => {
        console.log(`   ${index + 1}. ${perm.grantee}: ${perm.privilege_type}`);
      });
    } else {
      console.log('   No permissions found for anon/authenticated roles!');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkRLSPolicies();