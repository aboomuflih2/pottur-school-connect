import pkg from 'pg';
import fs from 'fs';
import path from 'path';
const { Client } = pkg;

async function backupLocalDatabase() {
  const client = new Client({
    host: '127.0.0.1',
    port: 54322,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
  });

  try {
    console.log('🔄 Connecting to local Supabase database...');
    await client.connect();
    console.log('✅ Connected to local database!');

    // Create backup directory
    const backupDir = './database-backup';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Get all tables in public schema
    console.log('📋 Getting list of tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`Found ${tables.length} tables:`, tables);

    // Export schema for each table
    console.log('\n📝 Exporting table schemas...');
    let schemaSQL = '-- Database Schema Export\n-- Generated: ' + new Date().toISOString() + '\n\n';
    
    for (const tableName of tables) {
      console.log(`  Exporting schema for: ${tableName}`);
      
      // Get table structure
      const columnsResult = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      schemaSQL += `-- Table: ${tableName}\n`;
      schemaSQL += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;
      
      const columns = columnsResult.rows.map(col => {
        let colDef = `  ${col.column_name} ${col.data_type}`;
        if (col.character_maximum_length) {
          colDef += `(${col.character_maximum_length})`;
        }
        if (col.is_nullable === 'NO') {
          colDef += ' NOT NULL';
        }
        if (col.column_default) {
          colDef += ` DEFAULT ${col.column_default}`;
        }
        return colDef;
      });
      
      schemaSQL += columns.join(',\n');
      schemaSQL += '\n);\n\n';
    }

    // Save schema
    fs.writeFileSync(path.join(backupDir, 'schema.sql'), schemaSQL);
    console.log('✅ Schema exported to database-backup/schema.sql');

    // Export data for each table
    console.log('\n📊 Exporting table data...');
    for (const tableName of tables) {
      console.log(`  Exporting data for: ${tableName}`);
      
      const dataResult = await client.query(`SELECT * FROM public.${tableName}`);
      const data = {
        table: tableName,
        rowCount: dataResult.rows.length,
        data: dataResult.rows
      };
      
      fs.writeFileSync(
        path.join(backupDir, `${tableName}_data.json`),
        JSON.stringify(data, null, 2)
      );
      
      console.log(`    Exported ${dataResult.rows.length} rows`);
    }

    // Export RLS policies
    console.log('\n🔒 Exporting RLS policies...');
    const policiesResult = await client.query(`
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

    const policies = {
      policies: policiesResult.rows,
      count: policiesResult.rows.length
    };
    
    fs.writeFileSync(
      path.join(backupDir, 'rls_policies.json'),
      JSON.stringify(policies, null, 2)
    );
    
    console.log(`✅ Exported ${policiesResult.rows.length} RLS policies`);

    // Export functions
    console.log('\n⚙️ Exporting functions...');
    const functionsResult = await client.query(`
      SELECT 
        routine_name,
        routine_definition,
        routine_type,
        data_type
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
      ORDER BY routine_name;
    `);

    const functions = {
      functions: functionsResult.rows,
      count: functionsResult.rows.length
    };
    
    fs.writeFileSync(
      path.join(backupDir, 'functions.json'),
      JSON.stringify(functions, null, 2)
    );
    
    console.log(`✅ Exported ${functionsResult.rows.length} functions`);

    await client.end();
    
    console.log('\n🎉 Database backup completed successfully!');
    console.log(`📁 Backup files saved in: ${backupDir}`);
    console.log('📋 Files created:');
    console.log('  - schema.sql (table structures)');
    console.log('  - *_data.json (table data)');
    console.log('  - rls_policies.json (Row Level Security policies)');
    console.log('  - functions.json (database functions)');
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

backupLocalDatabase();