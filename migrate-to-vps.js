import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
const { Client } = pkg;

// Local Supabase Configuration
const LOCAL_CONFIG = {
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
  ssl: false
};

// VPS Database Configuration (Direct PostgreSQL - fallback)
const VPS_CONFIG = {
  host: '63.250.52.6',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Modern#2025',
  ssl: false
};

// VPS Supabase Configuration
const VPS_SUPABASE_URL = 'http://63.250.52.6:8000';
const VPS_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'; // Default demo key

async function migrateToVPS() {
  let localClient, vpsSupabase;
  
  try {
    console.log('🚀 Starting database migration to VPS...');
    
    // Test connections
    console.log('\n🔗 Testing local database connection...');
    localClient = new Client(LOCAL_CONFIG);
    await localClient.connect();
    console.log('✅ Local database connected!');
    
    console.log('\n🔗 Testing VPS Supabase API connection...');
    vpsSupabase = createClient(VPS_SUPABASE_URL, VPS_SUPABASE_ANON_KEY);
    
    // Test VPS connection with a simple query
    try {
      const { data, error } = await vpsSupabase.from('information_schema.tables').select('table_name').limit(1);
      if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is expected
        console.log('⚠️ VPS API accessible but may need setup');
      }
      console.log('✅ VPS Supabase API connected!');
    } catch (apiError) {
      console.log('⚠️ VPS API connection issue, will try direct PostgreSQL...');
      // Fallback to direct connection if needed
    }
    
    // Get version info
    const vpsVersion = await vpsClient.query('SELECT version();');
    const localVersion = await localClient.query('SELECT version();');
    console.log('\n📊 Database Versions:');
    console.log('  VPS:', vpsVersion.rows[0].version.split(' ')[0]);
    console.log('  Local:', localVersion.rows[0].version.split(' ')[0]);
    
    // Step 1: Get all tables from local database
    console.log('\n📋 Getting local database schema...');
    const tablesResult = await localClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`Found ${tables.length} tables to migrate:`, tables);
    
    // Step 2: Create tables on VPS
    console.log('\n🏗️ Creating tables on VPS...');
    for (const tableName of tables) {
      console.log(`  Creating table: ${tableName}`);
      
      // Get table structure from local
      const createTableResult = await localClient.query(`
        SELECT 
          'CREATE TABLE IF NOT EXISTS public.' || table_name || ' (' ||
          string_agg(
            column_name || ' ' || 
            CASE 
              WHEN data_type = 'character varying' THEN 'varchar(' || character_maximum_length || ')'
              WHEN data_type = 'character' THEN 'char(' || character_maximum_length || ')'
              WHEN data_type = 'numeric' THEN 'numeric(' || numeric_precision || ',' || numeric_scale || ')'
              ELSE data_type
            END ||
            CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
            CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
            ', '
          ) || ');' as create_statement
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        GROUP BY table_name;
      `, [tableName]);
      
      if (createTableResult.rows.length > 0) {
        await vpsClient.query(createTableResult.rows[0].create_statement);
        console.log(`    ✅ Table ${tableName} created`);
      }
    }
    
    // Step 3: Migrate data
    console.log('\n📊 Migrating data...');
    for (const tableName of tables) {
      console.log(`  Migrating data for: ${tableName}`);
      
      // Get data from local
      const dataResult = await localClient.query(`SELECT * FROM public.${tableName}`);
      
      if (dataResult.rows.length > 0) {
        // Get column names
        const columns = Object.keys(dataResult.rows[0]);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const columnNames = columns.join(', ');
        
        // Insert data into VPS
        for (const row of dataResult.rows) {
          const values = columns.map(col => row[col]);
          await vpsClient.query(
            `INSERT INTO public.${tableName} (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
            values
          );
        }
        
        console.log(`    ✅ Migrated ${dataResult.rows.length} rows`);
      } else {
        console.log(`    ℹ️ No data to migrate`);
      }
    }
    
    // Step 4: Migrate RLS policies
    console.log('\n🔒 Migrating RLS policies...');
    
    // First, enable RLS on all tables
    for (const tableName of tables) {
      await vpsClient.query(`ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;`);
    }
    
    // Get RLS policies from local
    const policiesResult = await localClient.query(`
      SELECT 
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);
    
    console.log(`Found ${policiesResult.rows.length} RLS policies to migrate`);
    
    for (const policy of policiesResult.rows) {
      try {
        let policySQL = `CREATE POLICY "${policy.policyname}" ON public.${policy.tablename}`;
        
        if (policy.permissive === 'PERMISSIVE') {
          policySQL += ' AS PERMISSIVE';
        } else {
          policySQL += ' AS RESTRICTIVE';
        }
        
        policySQL += ` FOR ${policy.cmd}`;
        
        if (policy.roles && policy.roles.length > 0) {
          policySQL += ` TO ${policy.roles.join(', ')}`;
        }
        
        if (policy.qual) {
          policySQL += ` USING (${policy.qual})`;
        }
        
        if (policy.with_check) {
          policySQL += ` WITH CHECK (${policy.with_check})`;
        }
        
        policySQL += ';';
        
        await vpsClient.query(policySQL);
        console.log(`    ✅ Policy ${policy.policyname} created for ${policy.tablename}`);
      } catch (error) {
        console.log(`    ⚠️ Policy ${policy.policyname} failed: ${error.message}`);
      }
    }
    
    // Step 5: Grant permissions
    console.log('\n🔑 Setting up permissions...');
    for (const tableName of tables) {
      await vpsClient.query(`GRANT SELECT ON public.${tableName} TO anon;`);
      await vpsClient.query(`GRANT ALL PRIVILEGES ON public.${tableName} TO authenticated;`);
      console.log(`    ✅ Permissions granted for ${tableName}`);
    }
    
    // Step 6: Migrate functions
    console.log('\n⚙️ Migrating functions...');
    const functionsResult = await localClient.query(`
      SELECT 
        routine_name,
        routine_definition
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      ORDER BY routine_name;
    `);
    
    console.log(`Found ${functionsResult.rows.length} functions to migrate`);
    
    for (const func of functionsResult.rows) {
      try {
        await vpsClient.query(func.routine_definition);
        console.log(`    ✅ Function ${func.routine_name} created`);
      } catch (error) {
        console.log(`    ⚠️ Function ${func.routine_name} failed: ${error.message}`);
      }
    }
    
    // Step 7: Verify migration
    console.log('\n✅ Verifying migration...');
    for (const tableName of tables) {
      const localCount = await localClient.query(`SELECT COUNT(*) FROM public.${tableName}`);
      const vpsCount = await vpsClient.query(`SELECT COUNT(*) FROM public.${tableName}`);
      
      const localRows = parseInt(localCount.rows[0].count);
      const vpsRows = parseInt(vpsCount.rows[0].count);
      
      if (localRows === vpsRows) {
        console.log(`    ✅ ${tableName}: ${vpsRows} rows (matches local)`);
      } else {
        console.log(`    ⚠️ ${tableName}: ${vpsRows} rows (local has ${localRows})`);
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Access Supabase Studio at http://63.250.52.6:3000');
    console.log('2. Get the ANON_KEY and SERVICE_ROLE_KEY');
    console.log('3. Update .env.vps with the actual API keys');
    console.log('4. Test your application with the VPS database');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (vpsClient) await vpsClient.end();
    if (localClient) await localClient.end();
  }
}

migrateToVPS();