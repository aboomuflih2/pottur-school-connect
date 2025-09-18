import { Client } from 'pg';

async function testConnection() {
  const client = new Client({
    host: '63.250.52.6',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Modern#2025',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Attempting to connect to VPS PostgreSQL...');
    await client.connect();
    console.log('✅ Successfully connected to VPS PostgreSQL!');
    
    // Test basic query
    const result = await client.query('SELECT version();');
    console.log('📊 Database version:', result.rows[0].version);
    
    // Check existing tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('📋 Existing tables:', tables.rows.length);
    if (tables.rows.length > 0) {
      console.log('   Tables:', tables.rows.map(row => row.table_name).join(', '));
    }
    
    await client.end();
    console.log('🎉 Connection test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('🔍 Error details:', {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      address: error.address,
      port: error.port
    });
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});