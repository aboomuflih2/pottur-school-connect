import { Client } from 'pg';

const vpsConfig = {
  host: '63.250.52.6',
  user: 'postgres',
  password: 'Modern#2025',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

// Common PostgreSQL ports to test
const portsToTest = [5432, 5433, 25060, 26257, 3306, 1433];

async function testPorts() {
  console.log('🔍 Testing alternative PostgreSQL ports...');
  
  for (const port of portsToTest) {
    console.log(`\n🔄 Testing port ${port}...`);
    
    const client = new Client({
      ...vpsConfig,
      port: port,
      connectionTimeoutMillis: 5000
    });
    
    try {
      await client.connect();
      console.log(`✅ SUCCESS: PostgreSQL is running on port ${port}`);
      
      // Test basic query
      const result = await client.query('SELECT version()');
      console.log(`📊 Database version: ${result.rows[0].version}`);
      
      await client.end();
      
      console.log(`\n🎯 FOUND WORKING CONNECTION:`);
      console.log(`Host: ${vpsConfig.host}`);
      console.log(`Port: ${port}`);
      console.log(`Database: ${vpsConfig.database}`);
      console.log(`Username: ${vpsConfig.user}`);
      
      return { success: true, port };
      
    } catch (error) {
      console.log(`❌ Port ${port}: ${error.message}`);
    }
  }
  
  console.log('\n❌ No working PostgreSQL ports found');
  return { success: false };
}

testPorts().catch(console.error);