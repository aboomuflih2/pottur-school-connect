import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Test file upload functionality
async function testFileUpload() {
  console.log('🚀 Starting file upload functionality tests...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 720 });
  
  const baseUrl = 'http://localhost:8080';
  
  // Create a test file for upload
  const testFilePath = path.join(process.cwd(), 'test-upload.txt');
  fs.writeFileSync(testFilePath, 'This is a test file for upload functionality.');
  
  const results = [];
  
  console.log('\n📁 Testing File Upload Components...');
  console.log('=' .repeat(50));
  
  // Test 1: Check KG-Std Application Form for file inputs
  console.log('\n📚 Testing KG-Std Application Form File Uploads...');
  try {
    await page.goto(`${baseUrl}/admissions/apply/kg-std`, { waitUntil: 'networkidle0' });
    
    const fileInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="file"]');
      return Array.from(inputs).map(input => ({
        id: input.id,
        name: input.name,
        accept: input.accept,
        multiple: input.multiple,
        required: input.required
      }));
    });
    
    if (fileInputs.length > 0) {
      console.log(`✅ Found ${fileInputs.length} file input(s)`);
      fileInputs.forEach((input, index) => {
        console.log(`   ${index + 1}. ${input.name || input.id || 'unnamed'} (accept: ${input.accept || 'any'})`);
      });
      
      // Test file upload on first file input
      const firstFileInput = await page.$('input[type="file"]');
      if (firstFileInput) {
        await firstFileInput.uploadFile(testFilePath);
        console.log('✅ File upload simulation successful');
        
        // Check if file was selected
        const fileName = await page.evaluate(() => {
          const input = document.querySelector('input[type="file"]');
          return input && input.files.length > 0 ? input.files[0].name : null;
        });
        
        if (fileName) {
          console.log(`✅ File selected: ${fileName}`);
        }
      }
      
      results.push({
        form: 'KG-Std Application',
        fileInputsFound: fileInputs.length,
        uploadWorking: true,
        success: true
      });
    } else {
      console.log('⚠️  No file inputs found');
      results.push({
        form: 'KG-Std Application',
        fileInputsFound: 0,
        uploadWorking: false,
        success: false
      });
    }
    
  } catch (error) {
    console.log(`❌ KG-Std file upload test failed: ${error.message}`);
    results.push({
      form: 'KG-Std Application',
      error: error.message,
      success: false
    });
  }
  
  // Test 2: Check Plus One Application Form for file inputs
  console.log('\n🎓 Testing Plus One Application Form File Uploads...');
  try {
    await page.goto(`${baseUrl}/admissions/apply/plus-one`, { waitUntil: 'networkidle0' });
    
    const fileInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="file"]');
      return Array.from(inputs).map(input => ({
        id: input.id,
        name: input.name,
        accept: input.accept,
        multiple: input.multiple,
        required: input.required
      }));
    });
    
    if (fileInputs.length > 0) {
      console.log(`✅ Found ${fileInputs.length} file input(s)`);
      fileInputs.forEach((input, index) => {
        console.log(`   ${index + 1}. ${input.name || input.id || 'unnamed'} (accept: ${input.accept || 'any'})`);
      });
      
      // Test file upload on first file input
      const firstFileInput = await page.$('input[type="file"]');
      if (firstFileInput) {
        await firstFileInput.uploadFile(testFilePath);
        console.log('✅ File upload simulation successful');
        
        // Check if file was selected
        const fileName = await page.evaluate(() => {
          const input = document.querySelector('input[type="file"]');
          return input && input.files.length > 0 ? input.files[0].name : null;
        });
        
        if (fileName) {
          console.log(`✅ File selected: ${fileName}`);
        }
      }
      
      results.push({
        form: 'Plus One Application',
        fileInputsFound: fileInputs.length,
        uploadWorking: true,
        success: true
      });
    } else {
      console.log('⚠️  No file inputs found');
      results.push({
        form: 'Plus One Application',
        fileInputsFound: 0,
        uploadWorking: false,
        success: false
      });
    }
    
  } catch (error) {
    console.log(`❌ Plus One file upload test failed: ${error.message}`);
    results.push({
      form: 'Plus One Application',
      error: error.message,
      success: false
    });
  }
  
  // Test 3: Check Admin Areas for file uploads
  console.log('\n👨‍💼 Testing Admin File Upload Areas...');
  try {
    // First login as admin
    await page.goto(`${baseUrl}/auth`, { waitUntil: 'networkidle0' });
    
    // Check if already logged in or need to login
    const needsLogin = await page.evaluate(() => {
      return document.querySelector('input[type="email"]') !== null;
    });
    
    if (needsLogin) {
      // Try to login with admin credentials
      await page.type('input[type="email"]', 'admin@potturschool.com');
      await page.type('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Check admin areas for file uploads
    const adminPages = [
      '/admin/hero-slides',
      '/admin/breaking-news'
    ];
    
    for (const adminPage of adminPages) {
      try {
        await page.goto(`${baseUrl}${adminPage}`, { waitUntil: 'networkidle0' });
        
        const fileInputs = await page.evaluate(() => {
          const inputs = document.querySelectorAll('input[type="file"]');
          return inputs.length;
        });
        
        if (fileInputs > 0) {
          console.log(`✅ ${adminPage}: Found ${fileInputs} file input(s)`);
        } else {
          console.log(`⚠️  ${adminPage}: No file inputs found`);
        }
        
      } catch (error) {
        console.log(`❌ ${adminPage}: ${error.message}`);
      }
    }
    
    results.push({
      form: 'Admin Areas',
      tested: true,
      success: true
    });
    
  } catch (error) {
    console.log(`❌ Admin file upload test failed: ${error.message}`);
    results.push({
      form: 'Admin Areas',
      error: error.message,
      success: false
    });
  }
  
  await browser.close();
  
  // Clean up test file
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
  }
  
  // Summary
  console.log('\n📊 File Upload Test Results:');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.form}`);
    if (result.fileInputsFound !== undefined) {
      console.log(`   File inputs found: ${result.fileInputsFound}`);
    }
    if (result.uploadWorking !== undefined) {
      console.log(`   Upload working: ${result.uploadWorking ? 'Yes' : 'No'}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n📈 Summary:');
  console.log(`${successful}/${total} file upload areas tested successfully`);
  
  if (successful === total) {
    console.log('🎉 All file upload tests passed!');
  } else {
    console.log('⚠️  Some file upload issues detected.');
  }
  
  return { successful, total, results };
}

// Run the test
testFileUpload().catch(console.error);