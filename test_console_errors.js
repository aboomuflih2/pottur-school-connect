import puppeteer from 'puppeteer';

// Test for console errors and warnings
async function testConsoleErrors() {
  console.log('🚀 Starting console errors and warnings check...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 720 });
  
  const baseUrl = 'http://localhost:8080';
  
  // Collect console messages
  const consoleMessages = [];
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    consoleMessages.push({ type, text, url: page.url() });
    
    if (type === 'error') {
      errors.push({ text, url: page.url() });
    } else if (type === 'warning') {
      warnings.push({ text, url: page.url() });
    }
  });
  
  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({ message: error.message, url: page.url() });
  });
  
  // Collect failed requests
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure().errorText,
      page: page.url()
    });
  });
  
  const pagesToTest = [
    { name: 'Homepage', url: '/' },
    { name: 'About', url: '/about' },
    { name: 'Academics', url: '/academics' },
    { name: 'News & Events', url: '/news-events' },
    { name: 'KG-Std Application', url: '/admissions/apply/kg-std' },
    { name: 'Plus One Application', url: '/admissions/apply/plus-one' },
    { name: 'Application Tracking', url: '/admissions/track' },
    { name: 'Authentication', url: '/auth' }
  ];
  
  console.log('\n🔍 Checking pages for console errors and warnings...');
  console.log('=' .repeat(60));
  
  for (const pageInfo of pagesToTest) {
    console.log(`\n📄 Testing: ${pageInfo.name} (${pageInfo.url})`);
    
    try {
      const initialErrorCount = errors.length;
      const initialWarningCount = warnings.length;
      const initialPageErrorCount = pageErrors.length;
      const initialFailedRequestCount = failedRequests.length;
      
      await page.goto(`${baseUrl}${pageInfo.url}`, { 
        waitUntil: 'networkidle0',
        timeout: 10000
      });
      
      // Wait a bit for any async operations
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newErrors = errors.length - initialErrorCount;
      const newWarnings = warnings.length - initialWarningCount;
      const newPageErrors = pageErrors.length - initialPageErrorCount;
      const newFailedRequests = failedRequests.length - initialFailedRequestCount;
      
      if (newErrors === 0 && newWarnings === 0 && newPageErrors === 0 && newFailedRequests === 0) {
        console.log('✅ No console errors or warnings detected');
      } else {
        if (newErrors > 0) console.log(`❌ ${newErrors} new console errors`);
        if (newWarnings > 0) console.log(`⚠️  ${newWarnings} new console warnings`);
        if (newPageErrors > 0) console.log(`❌ ${newPageErrors} new page errors`);
        if (newFailedRequests > 0) console.log(`❌ ${newFailedRequests} new failed requests`);
      }
      
    } catch (error) {
      console.log(`❌ Failed to load page: ${error.message}`);
    }
  }
  
  await browser.close();
  
  // Summary Report
  console.log('\n📊 Console Errors and Warnings Report:');
  console.log('=' .repeat(60));
  
  console.log(`\n📈 Summary:`);
  console.log(`Total Console Errors: ${errors.length}`);
  console.log(`Total Console Warnings: ${warnings.length}`);
  console.log(`Total Page Errors: ${pageErrors.length}`);
  console.log(`Total Failed Requests: ${failedRequests.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Console Errors:');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. [${error.url}] ${error.text}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Console Warnings:');
    warnings.forEach((warning, index) => {
      console.log(`${index + 1}. [${warning.url}] ${warning.text}`);
    });
  }
  
  if (pageErrors.length > 0) {
    console.log('\n❌ Page Errors:');
    pageErrors.forEach((error, index) => {
      console.log(`${index + 1}. [${error.url}] ${error.message}`);
    });
  }
  
  if (failedRequests.length > 0) {
    console.log('\n❌ Failed Requests:');
    failedRequests.forEach((request, index) => {
      console.log(`${index + 1}. [${request.page}] ${request.url} - ${request.failure}`);
    });
  }
  
  const totalIssues = errors.length + pageErrors.length + failedRequests.length;
  const hasWarnings = warnings.length > 0;
  
  if (totalIssues === 0 && !hasWarnings) {
    console.log('\n🎉 No console errors or warnings found!');
  } else if (totalIssues === 0 && hasWarnings) {
    console.log('\n✅ No critical errors found, but some warnings detected.');
  } else {
    console.log('\n⚠️  Some console errors detected that need attention.');
  }
  
  return {
    errors: errors.length,
    warnings: warnings.length,
    pageErrors: pageErrors.length,
    failedRequests: failedRequests.length,
    totalIssues,
    hasWarnings
  };
}

// Run the test
testConsoleErrors().catch(console.error);