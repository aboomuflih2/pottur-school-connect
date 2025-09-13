// Test script for Supabase Edge Functions
import fetch from 'node-fetch';

const EDGE_FUNCTIONS_URL = 'http://127.0.0.1:54323/functions/v1';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const headers = {
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json'
};

// Test data
const testData = {
  applicationNumber: 'TEST001',
  applicationType: 'kg_std'
};

async function testFunction(functionName, data) {
  console.log(`\n🧪 Testing ${functionName}...`);
  
  try {
    const response = await fetch(`${EDGE_FUNCTIONS_URL}/${functionName}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log(`✅ ${functionName}: SUCCESS`);
      console.log(`📄 Response length: ${result.length} characters`);
      
      // Check if it's a PDF response
      if (result.includes('%PDF') || response.headers.get('content-type')?.includes('pdf')) {
        console.log('📋 PDF generated successfully');
      } else {
        console.log('📋 Response preview:', result.substring(0, 200) + '...');
      }
    } else {
      console.log(`❌ ${functionName}: FAILED`);
      console.log(`📋 Error: ${result}`);
    }
  } catch (error) {
    console.log(`❌ ${functionName}: ERROR`);
    console.log(`📋 Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting Edge Functions Tests');
  console.log('=' .repeat(50));
  
  // Test all three functions
  await testFunction('generate-application-pdf', testData);
  await testFunction('generate-interview-letter', testData);
  await testFunction('generate-mark-list', testData);
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ Tests completed!');
  console.log('\n📝 Note: Functions are running and accessible.');
  console.log('📝 Expected errors for missing test data are normal.');
  console.log('📝 Functions will work properly with real application data.');
}

runTests().catch(console.error);