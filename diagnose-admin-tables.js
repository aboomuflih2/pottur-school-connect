import { createClient } from '@supabase/supabase-js';

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminTables() {
  console.log('🔍 Checking admin dashboard tables...');
  
  const tablesToCheck = [
    'admission_forms',
    'kg_std_applications', 
    'plus_one_applications',
    'interview_subjects',
    'interview_subject_templates'
  ];
  
  for (const tableName of tablesToCheck) {
    console.log(`\n📋 Checking table: ${tableName}`);
    
    try {
      // Try to fetch data from the table
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(5);
      
      if (error) {
        console.log(`❌ Error accessing ${tableName}:`, error.message);
        
        // Check if it's a table not found error
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`🚫 Table ${tableName} does not exist`);
        } else if (error.message.includes('permission denied')) {
          console.log(`🔒 Permission denied for ${tableName}`);
        } else {
          console.log(`⚠️  Other error for ${tableName}:`, error.details || error.hint);
        }
      } else {
        console.log(`✅ Table ${tableName} exists with ${count} rows`);
        if (data && data.length > 0) {
          console.log(`📄 Sample columns:`, Object.keys(data[0]).join(', '));
        } else {
          console.log(`📄 Table is empty`);
        }
      }
    } catch (err) {
      console.log(`💥 Exception checking ${tableName}:`, err.message);
    }
  }
  
  // Check for applications view or combined table
  console.log('\n🔍 Checking for applications view/table...');
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ No applications table/view found:', error.message);
    } else {
      console.log('✅ Applications table/view exists');
    }
  } catch (err) {
    console.log('💥 Exception checking applications:', err.message);
  }
}

async function testAdminQueries() {
  console.log('\n🧪 Testing admin dashboard queries...');
  
  // Test admission forms query
  console.log('\n1. Testing admission forms query...');
  try {
    const { data, error } = await supabase
      .from('admission_forms')
      .select('*');
      
    if (error) {
      console.log('❌ Admission forms query failed:', error.message);
    } else {
      console.log('✅ Admission forms query successful:', data?.length || 0, 'records');
    }
  } catch (err) {
    console.log('💥 Exception in admission forms query:', err.message);
  }
  
  // Test applications query (combined)
  console.log('\n2. Testing applications query...');
  try {
    // Try to get both KG and Plus One applications
    const [kgResult, plusOneResult] = await Promise.all([
      supabase.from('kg_std_applications').select('*'),
      supabase.from('plus_one_applications').select('*')
    ]);
    
    if (kgResult.error && plusOneResult.error) {
      console.log('❌ Both application tables failed:');
      console.log('  KG:', kgResult.error.message);
      console.log('  Plus One:', plusOneResult.error.message);
    } else {
      const kgCount = kgResult.data?.length || 0;
      const plusOneCount = plusOneResult.data?.length || 0;
      console.log(`✅ Applications query successful: ${kgCount} KG + ${plusOneCount} Plus One = ${kgCount + plusOneCount} total`);
    }
  } catch (err) {
    console.log('💥 Exception in applications query:', err.message);
  }
  
  // Test interview subjects query
  console.log('\n3. Testing interview subjects query...');
  try {
    const { data, error } = await supabase
      .from('interview_subjects')
      .select('*');
      
    if (error) {
      console.log('❌ Interview subjects query failed:', error.message);
    } else {
      console.log('✅ Interview subjects query successful:', data?.length || 0, 'records');
    }
  } catch (err) {
    console.log('💥 Exception in interview subjects query:', err.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting admin dashboard diagnostics...');
    console.log('📍 Connecting to local Supabase:', supabaseUrl);
    
    await checkAdminTables();
    await testAdminQueries();
    
    console.log('\n✨ Diagnostics complete!');
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

main();