import puppeteer from 'puppeteer';

// Test navigation between all pages
async function testNavigation() {
  console.log('🚀 Starting navigation tests...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 720 });
  
  const baseUrl = 'http://localhost:8080';
  
  // Define routes to test
  const routes = [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About' },
    { path: '/academics', name: 'Academics' },
    { path: '/news-events', name: 'News & Events' },
    { path: '/news', name: 'News (alias)' },
    { path: '/admissions/apply/kg-std', name: 'KG-Std Application' },
    { path: '/admissions/apply/plus-one', name: 'Plus One Application' },
    { path: '/admissions/track', name: 'Application Tracking' },
    { path: '/auth', name: 'Authentication' },
    { path: '/nonexistent', name: 'Not Found (404)' }
  ];
  
  const results = [];
  
  for (const route of routes) {
    try {
      console.log(`Testing ${route.name} (${route.path})...`);
      
      const response = await page.goto(`${baseUrl}${route.path}`, {
        waitUntil: 'networkidle0',
        timeout: 10000
      });
      
      // Check if page loaded successfully
      const status = response.status();
      const title = await page.title();
      
      // Check for React errors
      const errors = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('[data-testid="error"], .error, .alert-error');
        return Array.from(errorElements).map(el => el.textContent);
      });
      
      // Check if page has content
      const hasContent = await page.evaluate(() => {
        return document.body.textContent.trim().length > 0;
      });
      
      results.push({
        route: route.path,
        name: route.name,
        status,
        title,
        hasContent,
        errors: errors.length > 0 ? errors : null,
        success: status === 200 && hasContent && errors.length === 0
      });
      
      console.log(`✅ ${route.name}: Status ${status}, Title: "${title}"`);
      
    } catch (error) {
      console.log(`❌ ${route.name}: ${error.message}`);
      results.push({
        route: route.path,
        name: route.name,
        status: 'ERROR',
        error: error.message,
        success: false
      });
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  await browser.close();
  
  // Summary
  console.log('\n📊 Navigation Test Results:');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.status}`);
    if (result.errors) {
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }
  });
  
  console.log('\n📈 Summary:');
  console.log(`${successful}/${total} routes working properly`);
  
  if (successful === total) {
    console.log('🎉 All navigation tests passed!');
  } else {
    console.log('⚠️  Some navigation issues detected.');
  }
  
  return { successful, total, results };
}

// Run the test
testNavigation().catch(console.error);