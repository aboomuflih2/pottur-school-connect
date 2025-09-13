import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📋 MIGRATION SQL READY TO COPY');
console.log('==================================================');
console.log('');
console.log('🔗 1. Open Supabase Dashboard: http://127.0.0.1:54321');
console.log('📝 2. Go to SQL Editor → New Query');
console.log('📄 3. Copy and paste the SQL below:');
console.log('');
console.log('==================================================');
console.log('SQL TO COPY:');
console.log('==================================================');

try {
  const migrationPath = join(__dirname, 'supabase', 'migrations', '016_fix_academic_programs_schema.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf8');
  
  console.log(migrationSQL);
  
  console.log('==================================================');
  console.log('END OF SQL');
  console.log('==================================================');
  console.log('');
  console.log('✅ 4. Click "Run" in the SQL Editor');
  console.log('🔍 5. After running, execute: node verify-migration.js');
  console.log('🎯 6. Test admin interface: http://localhost:8080/admin/academics');
  
} catch (error) {
  console.error('❌ Error reading migration file:', error.message);
}