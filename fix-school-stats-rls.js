import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixSchoolStatsRLS() {
  console.log('🔧 Fixing school_stats RLS policies...');
  
  try {
    // Step 1: Drop existing policies
    console.log('\n1️⃣ Dropping existing policies...');
    
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Admin full access" ON school_stats;',
      'DROP POLICY IF EXISTS "Public read access" ON school_stats;'
    ];
    
    for (const sql of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.log(`   ⚠️ ${sql} - ${error.message}`);
      } else {
        console.log(`   ✅ ${sql}`);
      }
    }
    
    // Step 2: Create new policies
    console.log('\n2️⃣ Creating new policies...');
    
    const createPolicies = [
      `CREATE POLICY "Allow public read access to school_stats" ON school_stats
        FOR SELECT USING (true);`,
      `CREATE POLICY "Allow admin full access to school_stats" ON school_stats
        FOR ALL USING (is_admin());`
    ];
    
    for (const sql of createPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.error(`   ❌ Failed: ${error.message}`);
        return;
      } else {
        console.log(`   ✅ Policy created successfully`);
      }
    }
    
    // Step 3: Grant permissions
    console.log('\n3️⃣ Granting permissions...');
    
    const grantPermissions = [
      'GRANT ALL ON school_stats TO authenticated;',
      'GRANT ALL ON school_stats TO anon;'
    ];
    
    for (const sql of grantPermissions) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.log(`   ⚠️ ${sql} - ${error.message}`);
      } else {
        console.log(`   ✅ ${sql}`);
      }
    }
    
    console.log('\n🎉 School stats RLS policies fixed successfully!');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Alternative approach: Use direct SQL execution
async function fixSchoolStatsRLSAlternative() {
  console.log('\n🔄 Trying alternative approach with direct SQL...');
  
  try {
    const fullSQL = `
      -- Drop existing policies
      DROP POLICY IF EXISTS "Admin full access" ON school_stats;
      DROP POLICY IF EXISTS "Public read access" ON school_stats;
      
      -- Create new policies
      CREATE POLICY "Allow public read access to school_stats" ON school_stats
        FOR SELECT USING (true);
      
      CREATE POLICY "Allow admin full access to school_stats" ON school_stats
        FOR ALL USING (is_admin());
      
      -- Grant permissions
      GRANT ALL ON school_stats TO authenticated;
      GRANT ALL ON school_stats TO anon;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql: fullSQL });
    
    if (error) {
      console.error('❌ Alternative approach failed:', error.message);
      return false;
    }
    
    console.log('✅ Alternative approach succeeded!');
    return true;
    
  } catch (error) {
    console.error('💥 Alternative approach error:', error);
    return false;
  }
}

async function main() {
  // Try the first approach
  await fixSchoolStatsRLS();
  
  // If that doesn't work, try the alternative
  const success = await fixSchoolStatsRLSAlternative();
  
  if (success) {
    console.log('\n🧪 Testing the fix...');
    // Test with a simple query
    const { data, error } = await supabase
      .from('school_stats')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Test failed:', error.message);
    } else {
      console.log('✅ Test passed! RLS policies are working.');
    }
  }
}

main();