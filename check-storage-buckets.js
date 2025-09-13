import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function checkStorageBuckets() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if storage schema exists
    const schemaResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'storage';
    `);
    
    if (schemaResult.rows.length === 0) {
      console.log('❌ Storage schema does not exist');
      return;
    }
    
    console.log('✅ Storage schema exists');
    
    // Check storage buckets
    const bucketsResult = await client.query('SELECT * FROM storage.buckets;');
    
    if (bucketsResult.rows.length === 0) {
      console.log('❌ No storage buckets found');
    } else {
      console.log('✅ Found storage buckets:');
      bucketsResult.rows.forEach(bucket => {
        console.log(`  - ${bucket.name} (${bucket.id})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkStorageBuckets();