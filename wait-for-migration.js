import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Monitoring database for migration completion...');
console.log('==================================================');
console.log('');
console.log('📋 INSTRUCTIONS:');
console.log('1. Go to Supabase Dashboard: http://127.0.0.1:54321');
console.log('2. Navigate to SQL Editor → New Query');
console.log('3. Copy the SQL from the terminal output above');
console.log('4. Paste and click "Run"');
console.log('5. This script will detect when migration is complete');
console.log('');
console.log('==================================================');

let checkCount = 0;
const maxChecks = 60; // Check for 5 minutes

async function checkMigrationStatus() {
  try {
    checkCount++;
    
    // Check if new schema exists
    const { data, error } = await supabase
      .from('academic_programs')
      .select('program_title')
      .limit(1);
    
    if (!error && data !== null) {
      console.log('\n✅ MIGRATION DETECTED!');
      console.log('==================================================');
      console.log('🎉 Database schema has been updated successfully!');
      console.log('');
      
      // Verify data
      const { data: programs, error: dataError } = await supabase
        .from('academic_programs')
        .select('*');
      
      if (!dataError && programs) {
        console.log(`📊 Found ${programs.length} academic programs:`);
        programs.forEach((program, index) => {
          console.log(`   ${index + 1}. ${program.program_title}`);
        });
      }
      
      console.log('');
      console.log('🚀 Next steps:');
      console.log('1. Test admin interface: http://localhost:8080/admin/academics');
      console.log('2. Try uploading an image to verify functionality');
      console.log('3. Check that images display correctly');
      
      process.exit(0);
    }
    
    if (checkCount >= maxChecks) {
      console.log('\n⏰ Timeout reached. Please run the migration manually.');
      process.exit(1);
    }
    
    process.stdout.write(`\r🔄 Checking... (${checkCount}/${maxChecks})`);
    
  } catch (error) {
    process.stdout.write(`\r🔄 Waiting for migration... (${checkCount}/${maxChecks})`);
  }
}

// Check every 5 seconds
setInterval(checkMigrationStatus, 5000);