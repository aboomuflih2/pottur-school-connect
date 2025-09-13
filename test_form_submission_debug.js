import { chromium } from 'playwright';

async function testAdminWorkflow() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to console messages
  page.on('console', msg => {
    console.log(`🖥️ Browser Console [${msg.type()}]:`, msg.text());
  });

  // Listen to network requests
  page.on('request', request => {
    if (request.url().includes('academic') || request.method() === 'POST') {
      console.log(`🌐 Request: ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('academic') || response.request().method() === 'POST') {
      console.log(`📡 Response: ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('🚀 Starting admin workflow test...');
    
    // Navigate to admin panel
    console.log('📍 Navigating to admin panel...');
    await page.goto('http://localhost:8080/admin');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'login-page.png' });
    console.log('📸 Screenshot saved: login-page.png');
    
    // Check if we're on login page or already logged in
    const isLoginPage = await page.locator('input[type="email"]').isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isLoginPage) {
      console.log('🔐 Found login form, logging in...');
      
      // Fill login form
      await page.fill('input[type="email"]', 'admin@potturschool.com');
      await page.fill('input[type="password"]', 'admin123');
      
      // Submit login
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      
      console.log('✅ Login submitted, waiting for redirect...');
      await page.waitForTimeout(2000);
    } else {
      console.log('ℹ️ Already logged in or no login required');
    }
    
    // Navigate to academics section
    console.log('📚 Looking for Academics link...');
    
    // Wait for the page to load and look for academics link
    await page.waitForTimeout(1000);
    
    // Try different selectors for the academics link
    const academicsSelectors = [
      'a[href*="academic"]',
      'text="Academics"',
      'text="Academic Programs"',
      '[data-testid="academics-link"]',
      'nav a:has-text("Academic")',
      'a:has-text("Academic")'
    ];
    
    let academicsLink = null;
    for (const selector of academicsSelectors) {
      try {
        academicsLink = page.locator(selector).first();
        if (await academicsLink.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found academics link with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ Selector ${selector} not found`);
      }
    }
    
    if (academicsLink && await academicsLink.isVisible()) {
      await academicsLink.click();
      console.log('🔗 Clicked academics link');
      await page.waitForLoadState('networkidle');
    } else {
      console.log('⚠️ Could not find academics link, trying direct navigation...');
      await page.goto('http://localhost:8080/admin/academics');
      await page.waitForLoadState('networkidle');
    }
    
    // Take screenshot of academics page
    await page.screenshot({ path: 'academics-page.png' });
    console.log('📸 Screenshot saved: academics-page.png');
    
    // Look for "Add New Program" button
    console.log('➕ Looking for Add New Program button...');
    
    const addButtonSelectors = [
      'text="Add New Program"',
      'button:has-text("Add")',
      'a:has-text("Add")',
      '[data-testid="add-program"]',
      'button:has-text("New")',
      'a:has-text("New")'
    ];
    
    let addButton = null;
    for (const selector of addButtonSelectors) {
      try {
        addButton = page.locator(selector).first();
        if (await addButton.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found add button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ Add button selector ${selector} not found`);
      }
    }
    
    if (addButton && await addButton.isVisible()) {
      await addButton.click();
      console.log('🔗 Clicked add new program button');
      await page.waitForLoadState('networkidle');
    } else {
      console.log('⚠️ Could not find add button, trying direct navigation...');
      await page.goto('http://localhost:8080/admin/academics/new');
      await page.waitForLoadState('networkidle');
    }
    
    // Take screenshot of form page
    await page.screenshot({ path: 'form-page.png' });
    console.log('📸 Screenshot saved: form-page.png');
    
    // Fill the form
    console.log('📝 Filling the form...');
    
    // Wait for form to be visible
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Fill form fields
    const formData = {
      program_title: 'Test Academic Program via UI',
      category: 'primary',
      short_description: 'This is a test program created via UI form',
      full_description: 'Full description for the test program created via UI'
    };
    
    // Fill title
    const titleInput = page.locator('input[name="program_title"], input[id*="title"], input[placeholder*="title"]').first();
    if (await titleInput.isVisible({ timeout: 5000 })) {
      await titleInput.fill(formData.program_title);
      console.log('✅ Filled title field');
    } else {
      console.log('❌ Could not find title field');
    }
    
    // Fill category
    const categorySelect = page.locator('select[name="category"], select[id*="category"]').first();
    if (await categorySelect.isVisible({ timeout: 5000 })) {
      await categorySelect.selectOption(formData.category);
      console.log('✅ Selected category');
    } else {
      console.log('❌ Could not find category field');
    }
    
    // Fill short description
    const shortDescInput = page.locator('input[name="short_description"], textarea[name="short_description"], input[id*="short"]').first();
    if (await shortDescInput.isVisible({ timeout: 5000 })) {
      await shortDescInput.fill(formData.short_description);
      console.log('✅ Filled short description');
    } else {
      console.log('❌ Could not find short description field');
    }
    
    // Fill full description
    const fullDescInput = page.locator('textarea[name="full_description"], textarea[id*="full"], textarea[id*="description"]:not([name="short_description"])').first();
    if (await fullDescInput.isVisible({ timeout: 5000 })) {
      await fullDescInput.fill(formData.full_description);
      console.log('✅ Filled full description');
    } else {
      console.log('❌ Could not find full description field');
    }
    
    // Take screenshot before submission
    await page.screenshot({ path: 'form-filled.png' });
    console.log('📸 Screenshot saved: form-filled.png');
    
    // Submit the form
    console.log('🚀 Submitting the form...');
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create"), button:has-text("Submit")').first();
    if (await submitButton.isVisible({ timeout: 5000 })) {
      await submitButton.click();
      console.log('✅ Clicked submit button');
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Take screenshot after submission
      await page.screenshot({ path: 'form-submitted.png' });
      console.log('📸 Screenshot saved: form-submitted.png');
      
      // Check for success/error messages
      const successMessage = await page.locator('text*="success", text*="created", text*="saved"').first().textContent({ timeout: 5000 }).catch(() => null);
      const errorMessage = await page.locator('text*="error", text*="failed", .error, .alert-error').first().textContent({ timeout: 5000 }).catch(() => null);
      
      if (successMessage) {
        console.log('✅ Success message found:', successMessage);
      } else if (errorMessage) {
        console.log('❌ Error message found:', errorMessage);
      } else {
        console.log('ℹ️ No success/error message found');
      }
      
      console.log('✅ Form submission test completed!');
    } else {
      console.log('❌ Could not find submit button');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('📸 Error screenshot saved: error-screenshot.png');
  } finally {
    await browser.close();
  }
}

testAdminWorkflow();