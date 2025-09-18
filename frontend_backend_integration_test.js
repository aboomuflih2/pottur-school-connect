// Frontend-Backend Integration Test
// This script tests the actual frontend-backend communication

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFrontendBackendIntegration() {
  console.log('🔗 Testing Frontend-Backend Integration...');
  console.log('=' .repeat(60));
  
  const testResults = {
    apiEndpoints: [],
    dataFlow: [],
    authentication: [],
    adminOperations: [],
    errors: []
  };

  try {
    // Test 1: API Endpoints Accessibility
    console.log('\n1. Testing API Endpoints...');
    const endpoints = [
      { name: 'News Posts', table: 'news_posts' },
      { name: 'Events', table: 'events' },
      { name: 'Academic Programs', table: 'academic_programs' },
      { name: 'User Roles', table: 'user_roles' },
      { name: 'Admission Applications', table: 'admission_applications' }
    ];

    for (const endpoint of endpoints) {
      try {
        const { data, error, count } = await supabase
          .from(endpoint.table)
          .select('*', { count: 'exact' })
          .limit(1);
        
        if (!error) {
          console.log(`   ✅ ${endpoint.name}: Accessible (${count || 0} records)`);
          testResults.apiEndpoints.push({ name: endpoint.name, status: 'success', count });
        } else {
          console.log(`   ❌ ${endpoint.name}: ${error.message}`);
          testResults.apiEndpoints.push({ name: endpoint.name, status: 'error', error: error.message });
          testResults.errors.push(`${endpoint.name} API: ${error.message}`);
        }
      } catch (err) {
        console.log(`   ❌ ${endpoint.name}: ${err.message}`);
        testResults.errors.push(`${endpoint.name} API: ${err.message}`);
      }
    }

    // Test 2: Data Flow (CRUD Operations)
    console.log('\n2. Testing Data Flow (CRUD Operations)...');
    
    // Test CREATE
    const testNewsPost = {
      title: 'Integration Test Post',
      slug: 'integration-test-' + Date.now(),
      content: 'Testing frontend-backend data flow',
      author: 'System Test',
      excerpt: 'Test excerpt for integration',
      is_published: false
    };

    const { data: createData, error: createError } = await supabase
      .from('news_posts')
      .insert([testNewsPost])
      .select();
    
    if (!createError && createData?.length > 0) {
      console.log('   ✅ CREATE operation: Working');
      testResults.dataFlow.push({ operation: 'CREATE', status: 'success' });
      
      const createdId = createData[0].id;
      
      // Test READ
      const { data: readData, error: readError } = await supabase
        .from('news_posts')
        .select('*')
        .eq('id', createdId)
        .single();
      
      if (!readError && readData) {
        console.log('   ✅ READ operation: Working');
        testResults.dataFlow.push({ operation: 'READ', status: 'success' });
        
        // Test UPDATE
        const { data: updateData, error: updateError } = await supabase
          .from('news_posts')
          .update({ title: 'Updated Integration Test Post' })
          .eq('id', createdId)
          .select();
        
        if (!updateError && updateData?.length > 0) {
          console.log('   ✅ UPDATE operation: Working');
          testResults.dataFlow.push({ operation: 'UPDATE', status: 'success' });
        } else {
          console.log('   ❌ UPDATE operation failed:', updateError?.message);
          testResults.dataFlow.push({ operation: 'UPDATE', status: 'error' });
          testResults.errors.push(`UPDATE operation: ${updateError?.message}`);
        }
      } else {
        console.log('   ❌ READ operation failed:', readError?.message);
        testResults.dataFlow.push({ operation: 'READ', status: 'error' });
        testResults.errors.push(`READ operation: ${readError?.message}`);
      }
      
      // Test DELETE (cleanup)
      const { error: deleteError } = await supabase
        .from('news_posts')
        .delete()
        .eq('id', createdId);
      
      if (!deleteError) {
        console.log('   ✅ DELETE operation: Working');
        testResults.dataFlow.push({ operation: 'DELETE', status: 'success' });
      } else {
        console.log('   ❌ DELETE operation failed:', deleteError.message);
        testResults.dataFlow.push({ operation: 'DELETE', status: 'error' });
        testResults.errors.push(`DELETE operation: ${deleteError.message}`);
      }
    } else {
      console.log('   ❌ CREATE operation failed:', createError?.message);
      testResults.dataFlow.push({ operation: 'CREATE', status: 'error' });
      testResults.errors.push(`CREATE operation: ${createError?.message}`);
    }

    // Test 3: Authentication System
    console.log('\n3. Testing Authentication System...');
    
    // Check session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (!sessionError) {
      console.log('   ✅ Session management: Working');
      testResults.authentication.push({ feature: 'Session Management', status: 'success' });
      
      if (sessionData.session) {
        console.log(`   ℹ️  Current user: ${sessionData.session.user.email}`);
      } else {
        console.log('   ℹ️  No active session');
      }
    } else {
      console.log('   ❌ Session management failed:', sessionError.message);
      testResults.authentication.push({ feature: 'Session Management', status: 'error' });
      testResults.errors.push(`Session management: ${sessionError.message}`);
    }

    // Test user retrieval
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (!userError) {
      console.log('   ✅ User retrieval: Working');
      testResults.authentication.push({ feature: 'User Retrieval', status: 'success' });
    } else {
      console.log('   ❌ User retrieval failed:', userError.message);
      testResults.authentication.push({ feature: 'User Retrieval', status: 'error' });
      testResults.errors.push(`User retrieval: ${userError.message}`);
    }

    // Test 4: Admin Operations
    console.log('\n4. Testing Admin Operations...');
    
    // Test admin table access
    const adminTables = ['user_roles', 'events', 'academic_programs'];
    for (const table of adminTables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (!error) {
        console.log(`   ✅ Admin ${table}: Accessible`);
        testResults.adminOperations.push({ table, status: 'success' });
      } else {
        console.log(`   ❌ Admin ${table}: ${error.message}`);
        testResults.adminOperations.push({ table, status: 'error', error: error.message });
        testResults.errors.push(`Admin ${table}: ${error.message}`);
      }
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    testResults.errors.push(`Unexpected error: ${error.message}`);
  }

  // Generate Final Report
  console.log('\n' + '=' .repeat(60));
  console.log('📊 FRONTEND-BACKEND INTEGRATION REPORT');
  console.log('=' .repeat(60));
  
  // API Endpoints Summary
  const successfulEndpoints = testResults.apiEndpoints.filter(e => e.status === 'success').length;
  console.log(`\n🔌 API Endpoints: ${successfulEndpoints}/${testResults.apiEndpoints.length} working`);
  
  // Data Flow Summary
  const successfulOperations = testResults.dataFlow.filter(o => o.status === 'success').length;
  console.log(`📊 CRUD Operations: ${successfulOperations}/${testResults.dataFlow.length} working`);
  
  // Authentication Summary
  const successfulAuth = testResults.authentication.filter(a => a.status === 'success').length;
  console.log(`🔐 Authentication: ${successfulAuth}/${testResults.authentication.length} working`);
  
  // Admin Operations Summary
  const successfulAdmin = testResults.adminOperations.filter(a => a.status === 'success').length;
  console.log(`👑 Admin Operations: ${successfulAdmin}/${testResults.adminOperations.length} working`);
  
  // Overall Status
  const totalTests = testResults.apiEndpoints.length + testResults.dataFlow.length + 
                    testResults.authentication.length + testResults.adminOperations.length;
  const totalSuccess = successfulEndpoints + successfulOperations + successfulAuth + successfulAdmin;
  
  console.log(`\n🎯 Overall Integration: ${totalSuccess}/${totalTests} tests passed`);
  
  if (testResults.errors.length === 0) {
    console.log('\n🎉 FRONTEND-BACKEND INTEGRATION: FULLY CONNECTED!');
    console.log('✨ All systems are communicating properly');
  } else {
    console.log('\n⚠️  INTEGRATION ISSUES DETECTED:');
    testResults.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  return testResults;
}

// Run the integration test
testFrontendBackendIntegration()
  .then((results) => {
    console.log('\n✅ Integration test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Integration test failed:', error.message);
    process.exit(1);
  });