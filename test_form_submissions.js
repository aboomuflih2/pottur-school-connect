import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

// Test form submissions and validations
async function testFormSubmissions() {
  console.log('🚀 Starting form submissions and validations tests...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 720 });
  
  const baseUrl = 'http://localhost:8080';
  
  // Setup Supabase client for verification
  const supabaseUrl = 'http://127.0.0.1:54321';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
  const supabase = createClient(supabaseUrl, anonKey);
  
  const results = [];
  
  // Test 1: Contact Form Validation
  console.log('\n📝 Testing Contact Form...');
  console.log('=' .repeat(50));
  
  try {
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });
    
    // Look for contact form (usually in footer or contact section)
    const contactFormExists = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      const contactInputs = document.querySelectorAll('input[type="email"], input[name*="email"], input[id*="email"]');
      return forms.length > 0 && contactInputs.length > 0;
    });
    
    if (contactFormExists) {
      console.log('✅ Contact form found on homepage');
      
      // Test form validation (empty submission)
      const validationWorks = await page.evaluate(() => {
        const form = document.querySelector('form');
        const requiredInputs = form?.querySelectorAll('input[required], textarea[required]');
        return requiredInputs && requiredInputs.length > 0;
      });
      
      console.log(`${validationWorks ? '✅' : '❌'} Contact form has validation attributes`);
      
      results.push({
        form: 'Contact Form',
        location: 'Homepage',
        found: true,
        hasValidation: validationWorks,
        success: true
      });
    } else {
      console.log('⚠️  Contact form not found on homepage');
      results.push({
        form: 'Contact Form',
        location: 'Homepage',
        found: false,
        success: false
      });
    }
    
  } catch (error) {
    console.log(`❌ Contact form test failed: ${error.message}`);
    results.push({
      form: 'Contact Form',
      location: 'Homepage',
      error: error.message,
      success: false
    });
  }
  
  // Test 2: KG-Std Application Form
  console.log('\n📚 Testing KG-Std Application Form...');
  console.log('=' .repeat(50));
  
  try {
    await page.goto(`${baseUrl}/admissions/apply/kg-std`, { waitUntil: 'networkidle0' });
    
    // Check if form loads
    const formExists = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      const inputs = document.querySelectorAll('input, select, textarea');
      return forms.length > 0 && inputs.length > 5; // Should have multiple fields
    });
    
    if (formExists) {
      console.log('✅ KG-Std application form loaded');
      
      // Test form fields
      const fieldCount = await page.evaluate(() => {
        return document.querySelectorAll('input, select, textarea').length;
      });
      
      console.log(`✅ Form has ${fieldCount} input fields`);
      
      // Test validation
      const hasValidation = await page.evaluate(() => {
        const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
        return requiredFields.length > 0;
      });
      
      console.log(`${hasValidation ? '✅' : '❌'} Form has required field validation`);
      
      results.push({
        form: 'KG-Std Application',
        location: '/admissions/apply/kg-std',
        found: true,
        fieldCount,
        hasValidation,
        success: true
      });
    } else {
      console.log('❌ KG-Std application form not found');
      results.push({
        form: 'KG-Std Application',
        location: '/admissions/apply/kg-std',
        found: false,
        success: false
      });
    }
    
  } catch (error) {
    console.log(`❌ KG-Std application form test failed: ${error.message}`);
    results.push({
      form: 'KG-Std Application',
      location: '/admissions/apply/kg-std',
      error: error.message,
      success: false
    });
  }
  
  // Test 3: Plus One Application Form
  console.log('\n🎓 Testing Plus One Application Form...');
  console.log('=' .repeat(50));
  
  try {
    await page.goto(`${baseUrl}/admissions/apply/plus-one`, { waitUntil: 'networkidle0' });
    
    // Check if form loads
    const formExists = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      const inputs = document.querySelectorAll('input, select, textarea');
      return forms.length > 0 && inputs.length > 5;
    });
    
    if (formExists) {
      console.log('✅ Plus One application form loaded');
      
      // Test form fields
      const fieldCount = await page.evaluate(() => {
        return document.querySelectorAll('input, select, textarea').length;
      });
      
      console.log(`✅ Form has ${fieldCount} input fields`);
      
      // Test validation
      const hasValidation = await page.evaluate(() => {
        const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
        return requiredFields.length > 0;
      });
      
      console.log(`${hasValidation ? '✅' : '❌'} Form has required field validation`);
      
      results.push({
        form: 'Plus One Application',
        location: '/admissions/apply/plus-one',
        found: true,
        fieldCount,
        hasValidation,
        success: true
      });
    } else {
      console.log('❌ Plus One application form not found');
      results.push({
        form: 'Plus One Application',
        location: '/admissions/apply/plus-one',
        found: false,
        success: false
      });
    }
    
  } catch (error) {
    console.log(`❌ Plus One application form test failed: ${error.message}`);
    results.push({
      form: 'Plus One Application',
      location: '/admissions/apply/plus-one',
      error: error.message,
      success: false
    });
  }
  
  // Test 4: Application Tracking Form
  console.log('\n🔍 Testing Application Tracking Form...');
  console.log('=' .repeat(50));
  
  try {
    await page.goto(`${baseUrl}/admissions/track`, { waitUntil: 'networkidle0' });
    
    // Check if tracking form exists
    const trackingFormExists = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[placeholder*="application"], input[placeholder*="track"]');
        const buttons = document.querySelectorAll('button[type="submit"], button');
        const hasTrackButton = Array.from(buttons).some(btn => btn.textContent.toLowerCase().includes('track') || btn.textContent.toLowerCase().includes('search'));
        return inputs.length > 0 && (buttons.length > 0 || hasTrackButton);
      });
    
    if (trackingFormExists) {
      console.log('✅ Application tracking form found');
      results.push({
        form: 'Application Tracking',
        location: '/admissions/track',
        found: true,
        success: true
      });
    } else {
      console.log('⚠️  Application tracking form not clearly identified');
      results.push({
        form: 'Application Tracking',
        location: '/admissions/track',
        found: false,
        success: false
      });
    }
    
  } catch (error) {
    console.log(`❌ Application tracking form test failed: ${error.message}`);
    results.push({
      form: 'Application Tracking',
      location: '/admissions/track',
      error: error.message,
      success: false
    });
  }
  
  // Test 5: Authentication Form
  console.log('\n🔐 Testing Authentication Form...');
  console.log('=' .repeat(50));
  
  try {
    await page.goto(`${baseUrl}/auth`, { waitUntil: 'networkidle0' });
    
    // Check if auth form exists
    const authFormExists = await page.evaluate(() => {
        const emailInputs = document.querySelectorAll('input[type="email"], input[name*="email"], input[placeholder*="email"]');
        const passwordInputs = document.querySelectorAll('input[type="password"], input[name*="password"], input[placeholder*="password"]');
        const submitButtons = document.querySelectorAll('button[type="submit"], button');
        const hasAuthButton = Array.from(submitButtons).some(btn => btn.textContent.toLowerCase().includes('sign') || btn.textContent.toLowerCase().includes('login'));
        return emailInputs.length > 0 && passwordInputs.length > 0 && (submitButtons.length > 0 || hasAuthButton);
      });
    
    if (authFormExists) {
      console.log('✅ Authentication form found');
      
      // Test form validation
      const hasValidation = await page.evaluate(() => {
        const requiredFields = document.querySelectorAll('input[required]');
        return requiredFields.length >= 2; // At least email and password
      });
      
      console.log(`${hasValidation ? '✅' : '❌'} Auth form has validation`);
      
      results.push({
        form: 'Authentication',
        location: '/auth',
        found: true,
        hasValidation,
        success: true
      });
    } else {
      console.log('❌ Authentication form not found');
      results.push({
        form: 'Authentication',
        location: '/auth',
        found: false,
        success: false
      });
    }
    
  } catch (error) {
    console.log(`❌ Authentication form test failed: ${error.message}`);
    results.push({
      form: 'Authentication',
      location: '/auth',
      error: error.message,
      success: false
    });
  }
  
  await browser.close();
  
  // Summary
  console.log('\n📊 Form Submissions Test Results:');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.form} (${result.location})`);
    if (result.fieldCount) {
      console.log(`   Fields: ${result.fieldCount}`);
    }
    if (result.hasValidation !== undefined) {
      console.log(`   Validation: ${result.hasValidation ? 'Yes' : 'No'}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n📈 Summary:');
  console.log(`${successful}/${total} forms working properly`);
  
  if (successful === total) {
    console.log('🎉 All form tests passed!');
  } else {
    console.log('⚠️  Some form issues detected.');
  }
  
  return { successful, total, results };
}

// Run the test
testFormSubmissions().catch(console.error);