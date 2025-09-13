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

async function addMissingColumns() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Adding missing columns to kg_std_applications table...');
    
    // List of columns to add
    const columnsToAdd = [
      { name: 'stage', type: 'TEXT', nullable: true },
      { name: 'need_madrassa', type: 'BOOLEAN', nullable: true, default: 'FALSE' },
      { name: 'previous_madrassa', type: 'TEXT', nullable: true },
      { name: 'has_siblings', type: 'BOOLEAN', nullable: true, default: 'FALSE' },
      { name: 'siblings_names', type: 'TEXT', nullable: true }
    ];
    
    for (const column of columnsToAdd) {
      try {
        let sql = `ALTER TABLE kg_std_applications ADD COLUMN ${column.name} ${column.type}`;
        if (column.nullable === false) {
          sql += ' NOT NULL';
        }
        if (column.default) {
          sql += ` DEFAULT ${column.default}`;
        }
        sql += ';';
        
        console.log(`Adding column: ${column.name}...`);
        await client.query(sql);
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️ Column ${column.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding column ${column.name}:`, error.message);
        }
      }
    }
    
    console.log('\nVerifying updated table structure...');
    
    // Check final table structure
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
    
    console.log('\n=== Updated Table Schema ===');
    console.log('Total columns:', result.rows.length);
    console.log('\nColumns:');
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable}`);
    });
    
    // Check for required columns
    const requiredColumns = ['stage', 'need_madrassa', 'previous_madrassa', 'has_siblings', 'siblings_names'];
    const existingColumns = result.rows.map(row => row.column_name);
    
    console.log('\n=== Column Check ===');
    requiredColumns.forEach(col => {
      const exists = existingColumns.includes(col);
      console.log(`${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    });
    
    const allColumnsExist = requiredColumns.every(col => existingColumns.includes(col));
    
    if (allColumnsExist) {
      console.log('\n🎉 All required columns are now present!');
    } else {
      console.log('\n⚠️ Some columns are still missing.');
    }
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run the migration
addMissingColumns()
  .then(() => {
    console.log('Column addition completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Column addition failed:', error.message);
    process.exit(1);
  });