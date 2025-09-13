import pg from 'pg';
const { Client } = pg;

// Direct PostgreSQL connection to local Supabase
const client = new Client({
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function verifySchema() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Checking kg_std_applications table schema...');
    
    // Get all columns for the table
    const result = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'kg_std_applications' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n=== kg_std_applications Table Schema ===');
    console.log('Total columns:', result.rows.length);
    console.log('\nColumns:');
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable}`);
    });
    
    // Check specifically for full_name and child_name
    const hasFullName = result.rows.some(row => row.column_name === 'full_name');
    const hasChildName = result.rows.some(row => row.column_name === 'child_name');
    
    console.log('\n=== Verification Results ===');
    console.log(`full_name column exists: ${hasFullName ? '✅ YES' : '❌ NO'}`);
    console.log(`child_name column exists: ${hasChildName ? '⚠️ YES (should be renamed)' : '✅ NO (correctly renamed)'}`);
    
    if (hasFullName && !hasChildName) {
      console.log('\n🎉 SUCCESS: Column rename completed successfully!');
      console.log('The table now has "full_name" column instead of "child_name".');
    } else if (hasChildName && !hasFullName) {
      console.log('\n❌ ERROR: Column rename failed - still has "child_name"');
    } else if (hasFullName && hasChildName) {
      console.log('\n⚠️ WARNING: Both columns exist - cleanup needed');
    } else {
      console.log('\n❓ UNKNOWN: Neither column found');
    }
    
  } catch (error) {
    console.error('Verification failed:', error.message);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run verification
verifySchema()
  .then(() => {
    console.log('Schema verification completed.');
  })
  .catch(error => {
    console.error('Schema verification failed:', error.message);
  });