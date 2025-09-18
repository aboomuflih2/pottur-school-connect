import pkg from 'pg';
import fs from 'fs';
import path from 'path';
const { Client } = pkg;

// VPS Database Configuration
const VPS_CONFIG = {
  host: '63.250.52.6',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Modern#2025',
  ssl: false
};

async function rollbackMigration() {
  let vpsClient;
  
  try {
    console.log('🔄 Starting migration rollback...');
    console.log('⚠️ WARNING: This will delete all data from VPS database!');
    
    // Connect to VPS
    console.log('\n🔗 Connecting to VPS database...');
    vpsClient = new Client(VPS_CONFIG);
    await vpsClient.connect();
    console.log('✅ VPS database connected!');
    
    // Get all tables in public schema
    console.log('\n📋 Getting list of tables to remove...');
    const tablesResult = await vpsClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`Found ${tables.length} tables:`, tables);
    
    if (tables.length === 0) {
      console.log('ℹ️ No tables found to rollback.');
      return;
    }
    
    // Confirm rollback
    console.log('\n⚠️ CONFIRMATION REQUIRED:');
    console.log('This will permanently delete all migrated data from VPS.');
    console.log('Make sure you have a backup before proceeding.');
    
    // Drop all tables
    console.log('\n🗑️ Dropping tables...');
    for (const tableName of tables) {
      try {
        await vpsClient.query(`DROP TABLE IF EXISTS public.${tableName} CASCADE;`);
        console.log(`    ✅ Dropped table: ${tableName}`);
      } catch (error) {
        console.log(`    ⚠️ Failed to drop ${tableName}: ${error.message}`);
      }
    }
    
    // Drop functions
    console.log('\n⚙️ Dropping functions...');
    const functionsResult = await vpsClient.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      ORDER BY routine_name;
    `);
    
    for (const func of functionsResult.rows) {
      try {
        await vpsClient.query(`DROP FUNCTION IF EXISTS public.${func.routine_name} CASCADE;`);
        console.log(`    ✅ Dropped function: ${func.routine_name}`);
      } catch (error) {
        console.log(`    ⚠️ Failed to drop function ${func.routine_name}: ${error.message}`);
      }
    }
    
    // Verify cleanup
    console.log('\n✅ Verifying cleanup...');
    const remainingTables = await vpsClient.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `);
    
    const remainingFunctions = await vpsClient.query(`
      SELECT COUNT(*) as count
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION';
    `);
    
    console.log(`Remaining tables: ${remainingTables.rows[0].count}`);
    console.log(`Remaining functions: ${remainingFunctions.rows[0].count}`);
    
    console.log('\n🎉 Rollback completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Your VPS database is now clean');
    console.log('2. You can re-run the migration if needed');
    console.log('3. Check your local backup in ./database-backup/');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (vpsClient) await vpsClient.end();
  }
}

// Add confirmation prompt
const args = process.argv.slice(2);
if (!args.includes('--confirm')) {
  console.log('⚠️ SAFETY CHECK:');
  console.log('This script will delete all data from the VPS database.');
  console.log('To proceed, run: node rollback-migration.js --confirm');
  process.exit(0);
}

rollbackMigration();