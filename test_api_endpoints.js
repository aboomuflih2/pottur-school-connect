import { createClient } from '@supabase/supabase-js';

// Test all API endpoints and responses
async function testAPIEndpoints() {
  console.log('🚀 Starting API endpoints tests...');
  
  // Use local Supabase instance
  const supabaseUrl = 'http://127.0.0.1:54321';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
  
  const supabase = createClient(supabaseUrl, anonKey);
  
  const results = [];
  
  // Test database tables (API endpoints)
  const tables = [
    { name: 'hero_slides', description: 'Hero slides data' },
    { name: 'breaking_news', description: 'Breaking news items' },
    { name: 'contacts', description: 'Contact information' },
    { name: 'about_page', description: 'About page content' },
    { name: 'leadership', description: 'Leadership team' },
    { name: 'school_features', description: 'School features' },
    { name: 'school_stats', description: 'School statistics' },
    { name: 'testimonials', description: 'Student testimonials' },
    { name: 'academic_programs', description: 'Academic programs' },
    { name: 'news_posts', description: 'News posts' },
    { name: 'events', description: 'School events' },
    { name: 'gallery', description: 'Photo gallery' },
    { name: 'social_links', description: 'Social media links' },
    { name: 'user_roles', description: 'User roles (admin only)' }
  ];
  
  console.log('\n📊 Testing Database Tables (API Endpoints):');
  console.log('=' .repeat(50));
  
  for (const table of tables) {
    try {
      console.log(`Testing ${table.name}...`);
      
      // Test SELECT operation
      const { data, error, count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact' })
        .limit(5);
      
      if (error) {
        console.log(`❌ ${table.name}: ${error.message}`);
        results.push({
          endpoint: table.name,
          description: table.description,
          status: 'error',
          error: error.message,
          success: false
        });
      } else {
        console.log(`✅ ${table.name}: ${count || 0} records, ${data?.length || 0} returned`);
        results.push({
          endpoint: table.name,
          description: table.description,
          status: 'success',
          recordCount: count || 0,
          returnedCount: data?.length || 0,
          success: true
        });
      }
      
    } catch (error) {
      console.log(`❌ ${table.name}: ${error.message}`);
      results.push({
        endpoint: table.name,
        description: table.description,
        status: 'error',
        error: error.message,
        success: false
      });
    }
  }
  
  // Test Supabase Edge Functions
  console.log('\n🔧 Testing Supabase Edge Functions:');
  console.log('=' .repeat(50));
  
  const edgeFunctions = [
    { name: 'generate-application-pdf', description: 'Generate application PDF' },
    { name: 'generate-mark-list', description: 'Generate mark list' },
    { name: 'generate-interview-letter', description: 'Generate interview letter' }
  ];
  
  for (const func of edgeFunctions) {
    try {
      console.log(`Testing ${func.name}...`);
      
      // Test function availability (OPTIONS request)
      const response = await fetch(`${supabaseUrl}/functions/v1/${func.name}`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok || response.status === 200) {
        console.log(`✅ ${func.name}: Function available`);
        results.push({
          endpoint: `functions/${func.name}`,
          description: func.description,
          status: 'available',
          success: true
        });
      } else {
        console.log(`⚠️  ${func.name}: Status ${response.status}`);
        results.push({
          endpoint: `functions/${func.name}`,
          description: func.description,
          status: `status_${response.status}`,
          success: false
        });
      }
      
    } catch (error) {
      console.log(`❌ ${func.name}: ${error.message}`);
      results.push({
        endpoint: `functions/${func.name}`,
        description: func.description,
        status: 'error',
        error: error.message,
        success: false
      });
    }
  }
  
  // Test Authentication API
  console.log('\n🔐 Testing Authentication API:');
  console.log('=' .repeat(50));
  
  try {
    // Test auth session check
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (!error) {
      console.log(`✅ Auth Session Check: Working (session: ${session ? 'active' : 'none'})`);
      results.push({
        endpoint: 'auth/session',
        description: 'Authentication session check',
        status: 'success',
        hasSession: !!session,
        success: true
      });
    } else {
      console.log(`❌ Auth Session Check: ${error.message}`);
      results.push({
        endpoint: 'auth/session',
        description: 'Authentication session check',
        status: 'error',
        error: error.message,
        success: false
      });
    }
  } catch (error) {
    console.log(`❌ Auth Session Check: ${error.message}`);
    results.push({
      endpoint: 'auth/session',
      description: 'Authentication session check',
      status: 'error',
      error: error.message,
      success: false
    });
  }
  
  // Summary
  console.log('\n📈 API Endpoints Test Results:');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.endpoint}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.recordCount !== undefined) {
      console.log(`   Records: ${result.recordCount}`);
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`${successful}/${total} API endpoints working properly`);
  
  if (successful === total) {
    console.log('🎉 All API endpoints tests passed!');
  } else {
    console.log('⚠️  Some API endpoint issues detected.');
  }
  
  return { successful, total, results };
}

// Run the test
testAPIEndpoints().catch(console.error);