import pkg from 'pg';
import fs from 'fs';
import path from 'path';
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

async function generateVPSMigration() {
  let localClient;
  
  try {
    console.log('🚀 Generating VPS migration SQL files...');
    
    // Connect to local database
    console.log('\n🔗 Connecting to local database...');
    localClient = new Client(LOCAL_CONFIG);
    await localClient.connect();
    console.log('✅ Local database connected!');
    
    // Create output directory
    const outputDir = './vps-migration-sql';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('\n📋 Generating migration files...');
    
    // 1. Generate schema creation SQL
    console.log('\n1️⃣ Generating schema SQL...');
    const schemaResult = await localClient.query(`
      SELECT 
        'CREATE TABLE IF NOT EXISTS ' || table_name || ' (' ||
        string_agg(
          column_name || ' ' || 
          CASE 
            WHEN data_type = 'character varying' THEN 'VARCHAR' || COALESCE('(' || character_maximum_length || ')', '')
            WHEN data_type = 'character' THEN 'CHAR' || COALESCE('(' || character_maximum_length || ')', '')
            WHEN data_type = 'numeric' THEN 'NUMERIC' || COALESCE('(' || numeric_precision || ',' || numeric_scale || ')', '')
            WHEN data_type = 'integer' THEN 'INTEGER'
            WHEN data_type = 'bigint' THEN 'BIGINT'
            WHEN data_type = 'smallint' THEN 'SMALLINT'
            WHEN data_type = 'boolean' THEN 'BOOLEAN'
            WHEN data_type = 'text' THEN 'TEXT'
            WHEN data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
            WHEN data_type = 'timestamp with time zone' THEN 'TIMESTAMPTZ'
            WHEN data_type = 'date' THEN 'DATE'
            WHEN data_type = 'time without time zone' THEN 'TIME'
            WHEN data_type = 'uuid' THEN 'UUID'
            WHEN data_type = 'json' THEN 'JSON'
            WHEN data_type = 'jsonb' THEN 'JSONB'
            ELSE UPPER(data_type)
          END ||
          CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
          CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
          ', '
        ) || ');' as create_statement
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name NOT LIKE 'pg_%'
        AND table_name NOT LIKE 'sql_%'
      GROUP BY table_name
      ORDER BY table_name;
    `);
    
    let schemaSQL = '-- VPS Database Schema Migration\n-- Generated: ' + new Date().toISOString() + '\n\n';
    schemaSQL += '-- Enable necessary extensions\n';
    schemaSQL += 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n';
    
    for (const row of schemaResult.rows) {
      schemaSQL += row.create_statement + '\n\n';
    }
    
    fs.writeFileSync(path.join(outputDir, '01_schema.sql'), schemaSQL);
    console.log('    ✅ Schema SQL generated');
    
    // 2. Generate data insertion SQL
    console.log('\n2️⃣ Generating data insertion SQL...');
    const tablesResult = await localClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE 'pg_%'
        AND table_name NOT LIKE 'sql_%'
      ORDER BY table_name;
    `);
    
    let dataSQL = '-- VPS Database Data Migration\n-- Generated: ' + new Date().toISOString() + '\n\n';
    
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      
      // Get table data
      const dataResult = await localClient.query(`SELECT * FROM ${tableName}`);
      
      if (dataResult.rows.length > 0) {
        dataSQL += `-- Data for table: ${tableName}\n`;
        
        // Get column names
        const columns = Object.keys(dataResult.rows[0]);
        const columnList = columns.join(', ');
        
        dataSQL += `DELETE FROM ${tableName};\n`;
        
        for (const row of dataResult.rows) {
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') {
              return "'" + value.replace(/'/g, "''") + "'";
            }
            if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
            if (value instanceof Date) return "'" + value.toISOString() + "'";
            return value;
          }).join(', ');
          
          dataSQL += `INSERT INTO ${tableName} (${columnList}) VALUES (${values});\n`;
        }
        
        dataSQL += '\n';
        console.log(`    ✅ Data for ${tableName}: ${dataResult.rows.length} rows`);
      }
    }
    
    fs.writeFileSync(path.join(outputDir, '02_data.sql'), dataSQL);
    console.log('    ✅ Data SQL generated');
    
    // 3. Generate RLS policies SQL
    console.log('\n3️⃣ Generating RLS policies SQL...');
    const rlsResult = await localClient.query(`
      SELECT 
        schemaname,
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
    
    let rlsSQL = '-- VPS Database RLS Policies Migration\n-- Generated: ' + new Date().toISOString() + '\n\n';
    
    // First enable RLS on all tables
    for (const table of tablesResult.rows) {
      rlsSQL += `ALTER TABLE ${table.table_name} ENABLE ROW LEVEL SECURITY;\n`;
    }
    rlsSQL += '\n';
    
    // Then create policies
    for (const policy of rlsResult.rows) {
      rlsSQL += `-- Policy: ${policy.policyname} on ${policy.tablename}\n`;
      rlsSQL += `DROP POLICY IF EXISTS "${policy.policyname}" ON ${policy.tablename};\n`;
      
      let createPolicy = `CREATE POLICY "${policy.policyname}" ON ${policy.tablename}`;
      
      if (policy.cmd !== 'ALL') {
        createPolicy += ` FOR ${policy.cmd}`;
      }
      
      if (policy.roles && policy.roles.length > 0) {
        let rolesList;
        if (Array.isArray(policy.roles)) {
          rolesList = policy.roles.map(role => `"${role}"`).join(', ');
        } else {
          // Handle case where roles is a string like '{anon,authenticated}'
          const rolesStr = policy.roles.replace(/[{}]/g, '');
          const rolesArray = rolesStr.split(',').map(role => role.trim());
          rolesList = rolesArray.map(role => `"${role}"`).join(', ');
        }
        createPolicy += ` TO ${rolesList}`;
      }
      
      if (policy.qual) {
        createPolicy += ` USING (${policy.qual})`;
      }
      
      if (policy.with_check) {
        createPolicy += ` WITH CHECK (${policy.with_check})`;
      }
      
      createPolicy += ';\n\n';
      rlsSQL += createPolicy;
    }
    
    fs.writeFileSync(path.join(outputDir, '03_rls_policies.sql'), rlsSQL);
    console.log(`    ✅ RLS policies generated: ${rlsResult.rows.length} policies`);
    
    // 4. Generate functions SQL
    console.log('\n4️⃣ Generating functions SQL...');
    const functionsResult = await localClient.query(`
      SELECT 
        routine_name,
        routine_definition,
        data_type as return_type,
        routine_body,
        external_language
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
        AND routine_type = 'FUNCTION'
      ORDER BY routine_name;
    `);
    
    let functionsSQL = '-- VPS Database Functions Migration\n-- Generated: ' + new Date().toISOString() + '\n\n';
    
    for (const func of functionsResult.rows) {
      functionsSQL += `-- Function: ${func.routine_name}\n`;
      functionsSQL += `DROP FUNCTION IF EXISTS ${func.routine_name};\n`;
      
      if (func.routine_definition) {
        functionsSQL += func.routine_definition + '\n\n';
      }
    }
    
    fs.writeFileSync(path.join(outputDir, '04_functions.sql'), functionsSQL);
    console.log(`    ✅ Functions generated: ${functionsResult.rows.length} functions`);
    
    // 5. Generate permissions SQL
    console.log('\n5️⃣ Generating permissions SQL...');
    let permissionsSQL = '-- VPS Database Permissions Migration\n-- Generated: ' + new Date().toISOString() + '\n\n';
    
    permissionsSQL += '-- Grant permissions to anon and authenticated roles\n';
    for (const table of tablesResult.rows) {
      permissionsSQL += `GRANT SELECT ON ${table.table_name} TO anon;\n`;
      permissionsSQL += `GRANT ALL PRIVILEGES ON ${table.table_name} TO authenticated;\n`;
    }
    
    fs.writeFileSync(path.join(outputDir, '05_permissions.sql'), permissionsSQL);
    console.log('    ✅ Permissions SQL generated');
    
    // 6. Generate execution script
    const executionScript = `#!/bin/bash
# VPS Migration Execution Script
# Run this script on your VPS to apply the migration

echo "🚀 Starting VPS database migration..."

echo "\n1️⃣ Creating schema..."
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 01_schema.sql

echo "\n2️⃣ Inserting data..."
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 02_data.sql

echo "\n3️⃣ Setting up RLS policies..."
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 03_rls_policies.sql

echo "\n4️⃣ Creating functions..."
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 04_functions.sql

echo "\n5️⃣ Setting permissions..."
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 05_permissions.sql

echo "\n✅ Migration completed!"
echo "\n📋 Next steps:"
echo "1. Get Supabase API keys from http://63.250.52.6:3000"
echo "2. Update .env.vps with actual keys"
echo "3. Test your application"
`;
    
    fs.writeFileSync(path.join(outputDir, 'run_migration.sh'), executionScript);
    
    // Create Windows batch file
    const windowsScript = `@echo off
REM VPS Migration Execution Script
REM Run this script on your VPS to apply the migration

echo Starting VPS database migration...

echo.
echo 1. Creating schema...
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 01_schema.sql

echo.
echo 2. Inserting data...
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 02_data.sql

echo.
echo 3. Setting up RLS policies...
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 03_rls_policies.sql

echo.
echo 4. Creating functions...
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 04_functions.sql

echo.
echo 5. Setting permissions...
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 05_permissions.sql

echo.
echo Migration completed!
echo.
echo Next steps:
echo 1. Get Supabase API keys from http://63.250.52.6:3000
echo 2. Update .env.vps with actual keys
echo 3. Test your application
`;
    fs.writeFileSync(path.join(outputDir, 'run_migration.bat'), windowsScript);
    
    console.log('\n🎉 Migration files generated successfully!');
    console.log('\n📁 Generated files:');
    console.log('    📄 01_schema.sql - Database schema');
    console.log('    📄 02_data.sql - Table data');
    console.log('    📄 03_rls_policies.sql - Row Level Security policies');
    console.log('    📄 04_functions.sql - Database functions');
    console.log('    📄 05_permissions.sql - Role permissions');
    console.log('    📄 run_migration.sh - Execution script (Linux/Mac)');
    console.log('    📄 run_migration.bat - Execution script (Windows)');
    
    console.log('\n📋 Manual execution steps:');
    console.log('1. Copy all SQL files to your VPS');
    console.log('2. Run the files in order using psql or Supabase Studio');
    console.log('3. Or use the provided execution script');
    console.log('\n⚠️ Note: Direct PostgreSQL connection to VPS is not available.');
    console.log('You can execute these SQL files through:');
    console.log('- Supabase Studio SQL Editor: http://63.250.52.6:3000');
    console.log('- If you have VPS access, run the execution script directly on VPS');
    
  } catch (error) {
    console.error('❌ Migration generation failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (localClient) await localClient.end();
  }
}

generateVPSMigration()