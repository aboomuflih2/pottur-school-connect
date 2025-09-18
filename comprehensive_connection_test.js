// Comprehensive connection test
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Comprehensive Connection Test');
console.log('================================');

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function testConnections() {
  const results = {
    frontend: false,
    backend: false,
    supabaseRest: false,
    supabaseAuth: false,
    databaseTables: false,
    errors: []
  };

  try {
    // Test 1: Frontend server
    console.log('\n1. Testing Frontend Server...');
    try {
      const response = await fetch('http://localhost:8080');
      if (response.ok) {
        console.log('✅ Frontend server is running');
        results.frontend = true;
      } else {
        console.log('❌ Frontend server returned error:', response.status);
        results.errors.push('Frontend server error: ' + response.status);
      }
    } catch (error) {
      console.log('❌ Frontend server not accessible:', error.message);
      results.errors.push('Frontend server not accessible: ' + error.message);
    }

    // Test 2: Backend server
    console.log('\n2. Testing Backend Server...');
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend server is running:', data.status);
        results.backend = true;
      } else {
        console.log('❌ Backend server returned error:', response.status);
        results.errors.push('Backend server error: ' + response.status);
      }
    } catch (error) {
      console.log('❌ Backend server not accessible:', error.message);
      results.errors.push('Backend server not accessible: ' + error.message);
    }

    // Test 3: Supabase REST API
    console.log('\n3. Testing Supabase REST API...');
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (response.ok) {
        console.log('✅ Supabase REST API is accessible');
        results.supabaseRest = true;
      } else {
        console.log('❌ Supabase REST API error:', response.status);
        results.errors.push('Supabase REST API error: ' + response.status);
      }
    } catch (error) {
      console.log('❌ Supabase REST API not accessible:', error.message);
      results.errors.push('Supabase REST API not accessible: ' + error.message);
    }

    // Test 4: Supabase Auth
    console.log('\n4. Testing Supabase Auth...');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error) {
        console.log('✅ Supabase Auth is working');
        console.log('Current session:', data.session ? 'Active' : 'No active session');
        results.supabaseAuth = true;
      } else {
        console.log('❌ Supabase Auth error:', error.message);
        results.errors.push('Supabase Auth error: ' + error.message);
      }
    } catch (error) {
      console.log('❌ Supabase Auth failed:', error.message);
      results.errors.push('Supabase Auth failed: ' + error.message);
    }

    // Test 5: Database Tables
    console.log('\n5. Testing Database Tables...');
    try {
      // Try to query some common tables
      const tables = ['users', 'academic_programs', 'hero_slides', 'school_stats'];
      let tablesFound = 0;
      
      for (const table of tables) {
        try {
          const { data, error } = await supabaseAdmin
            .from(table)
            .select('*')
            .limit(1);
          
          if (!error) {
            console.log(`✅ Table '${table}' is accessible`);
            tablesFound++;
          } else {
            console.log(`❌ Table '${table}' error:`, error.message);
          }
        } catch (tableError) {
          console.log(`❌ Table '${table}' failed:`, tableError.message);
        }
      }
      
      if (tablesFound > 0) {
        results.databaseTables = true;
        console.log(`✅ Found ${tablesFound}/${tables.length} tables`);
      } else {
        console.log('❌ No tables accessible');
        results.errors.push('No database tables accessible');
      }
    } catch (error) {
      console.log('❌ Database tables test failed:', error.message);
      results.errors.push('Database tables test failed: ' + error.message);
    }

    // Summary
    console.log('\n📊 Connection Test Summary');
    console.log('==========================');
    console.log('Frontend Server:', results.frontend ? '✅ Connected' : '❌ Disconnected');
    console.log('Backend Server:', results.backend ? '✅ Connected' : '❌ Disconnected');
    console.log('Supabase REST API:', results.supabaseRest ? '✅ Connected' : '❌ Disconnected');
    console.log('Supabase Auth:', results.supabaseAuth ? '✅ Connected' : '❌ Disconnected');
    console.log('Database Tables:', results.databaseTables ? '✅ Connected' : '❌ Disconnected');
    
    const totalConnections = Object.values(results).filter(v => typeof v === 'boolean' && v).length;
    const totalTests = Object.values(results).filter(v => typeof v === 'boolean').length;
    
    console.log(`\n🎯 Overall Status: ${totalConnections}/${totalTests} connections working`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ Issues Found:');
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (totalConnections === totalTests) {
      console.log('\n🎉 All connections are working properly!');
    } else {
      console.log('\n⚠️  Some connections need attention.');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

testConnections();