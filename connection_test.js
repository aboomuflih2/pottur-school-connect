import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFrontendBackendConnection() {
  console.log('🔍 Starting Frontend-Backend Connection Test...');
  console.log('=' .repeat(50));
  
  const results = {
    environmentVariables: false,
    supabaseConnection: false,
    databaseRead: false,
    databaseWrite: false,
    authentication: false,
    adminFunctions: false,
    errors: []
  };

  try {
    // 1. Test Environment Variables
    console.log('\n1. Testing Environment Variables...');
    if (supabaseUrl && supabaseAnonKey) {
      console.log('✅ Environment variables loaded successfully');
      console.log(`   - Supabase URL: ${supabaseUrl}`);
      console.log(`   - Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
      results.environmentVariables = true;
    } else {
      console.log('❌ Missing environment variables');
      results.errors.push('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
    }

    // 2. Test Supabase Connection
    console.log('\n2. Testing Supabase Connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('news_posts')
      .select('count', { count: 'exact', head: true });
    
    if (!healthError) {
      console.log('✅ Supabase connection successful');
      results.supabaseConnection = true;
    } else {
      console.log('❌ Supabase connection failed:', healthError.message);
      results.errors.push(`Supabase connection: ${healthError.message}`);
    }

    // 3. Test Database Read Operations
    console.log('\n3. Testing Database Read Operations...');
    const { data: newsData, error: readError } = await supabase
      .from('news_posts')
      .select('*')
      .limit(1);
    
    if (!readError) {
      console.log('✅ Database read operations working');
      console.log(`   - Found ${newsData?.length || 0} news posts`);
      results.databaseRead = true;
    } else {
      console.log('❌ Database read failed:', readError.message);
      results.errors.push(`Database read: ${readError.message}`);
    }

    // 4. Test Database Write Operations (Insert & Delete)
    console.log('\n4. Testing Database Write Operations...');
    const testPost = {
      title: 'Connection Test Post',
      slug: 'connection-test-post-' + Date.now(),
      content: 'This is a test post for connection verification',
      author: 'System Test',
      excerpt: 'Test excerpt',
      is_published: false
    };

    const { data: insertData, error: insertError } = await supabase
      .from('news_posts')
      .insert([testPost])
      .select();
    
    if (!insertError && insertData?.length > 0) {
      console.log('✅ Database write (INSERT) working');
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('news_posts')
        .delete()
        .eq('id', insertData[0].id);
      
      if (!deleteError) {
        console.log('✅ Database write (DELETE) working');
        results.databaseWrite = true;
      } else {
        console.log('⚠️  INSERT worked but DELETE failed:', deleteError.message);
        results.errors.push(`Database delete: ${deleteError.message}`);
      }
    } else {
      console.log('❌ Database write failed:', insertError?.message);
      results.errors.push(`Database write: ${insertError?.message}`);
    }

    // 5. Test Authentication Flow
    console.log('\n5. Testing Authentication...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (!authError) {
      console.log('✅ Authentication system accessible');
      if (session) {
        console.log('   - User is currently logged in');
        console.log(`   - User ID: ${session.user.id}`);
      } else {
        console.log('   - No active session (user not logged in)');
      }
      results.authentication = true;
    } else {
      console.log('❌ Authentication system error:', authError.message);
      results.errors.push(`Authentication: ${authError.message}`);
    }

    // 6. Test Admin Functions
    console.log('\n6. Testing Admin Functions...');
    const adminTables = ['events', 'academic_programs', 'user_roles'];
    let adminTestsPassed = 0;
    
    for (const table of adminTables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (!error) {
        console.log(`   ✅ ${table} table accessible`);
        adminTestsPassed++;
      } else {
        console.log(`   ❌ ${table} table error: ${error.message}`);
        results.errors.push(`Admin table ${table}: ${error.message}`);
      }
    }
    
    if (adminTestsPassed === adminTables.length) {
      console.log('✅ All admin functions accessible');
      results.adminFunctions = true;
    } else {
      console.log(`⚠️  ${adminTestsPassed}/${adminTables.length} admin functions working`);
    }

    // 7. Test RLS Policies
    console.log('\n7. Testing RLS Policies...');
    const { data: rls, error: rlsError } = await supabase.rpc('check_rls_status');
    
    if (!rlsError) {
      console.log('✅ RLS policies accessible');
    } else {
      console.log('⚠️  RLS check failed (function may not exist):', rlsError.message);
    }

  } catch (error) {
    console.log('❌ Unexpected error during testing:', error.message);
    results.errors.push(`Unexpected error: ${error.message}`);
  }

  // Final Report
  console.log('\n' + '=' .repeat(50));
  console.log('📊 CONNECTION TEST RESULTS');
  console.log('=' .repeat(50));
  
  const testResults = [
    { name: 'Environment Variables', status: results.environmentVariables },
    { name: 'Supabase Connection', status: results.supabaseConnection },
    { name: 'Database Read', status: results.databaseRead },
    { name: 'Database Write', status: results.databaseWrite },
    { name: 'Authentication', status: results.authentication },
    { name: 'Admin Functions', status: results.adminFunctions }
  ];
  
  testResults.forEach(test => {
    const icon = test.status ? '✅' : '❌';
    console.log(`${icon} ${test.name}: ${test.status ? 'WORKING' : 'FAILED'}`);
  });
  
  const passedTests = testResults.filter(t => t.status).length;
  const totalTests = testResults.length;
  
  console.log(`\n🎯 Overall Status: ${passedTests}/${totalTests} tests passed`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 ERRORS FOUND:');
    results.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL SYSTEMS CONNECTED AND WORKING!');
  } else {
    console.log('\n⚠️  SOME ISSUES DETECTED - CHECK ERRORS ABOVE');
  }
  
  return results;
}

// Run the test
testFrontendBackendConnection()
  .then(() => {
    console.log('\n✨ Connection test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed with error:', error);
    process.exit(1);
  });