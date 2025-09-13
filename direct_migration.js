import pg from 'pg';
const { Client } = pg;

// Direct PostgreSQL connection to local Supabase
const client = new Client({
  host: '127.0.0.1',
  port: 54322, // PostgreSQL port for local Supabase
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function renameColumn() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Connected! Checking current table structure...');
    
    // Check current columns
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'kg_std_applications' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('Current columns:');
    columnsResult.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type})`);
    });
    
    // Check if child_name exists
    const hasChildName = columnsResult.rows.some(row => row.column_name === 'child_name');
    const hasFullName = columnsResult.rows.some(row => row.column_name === 'full_name');
    
    if (hasFullName) {
      console.log('✅ full_name column already exists!');
      return;
    }
    
    if (!hasChildName) {
      console.log('❌ child_name column not found!');
      return;
    }
    
    console.log('Renaming child_name to full_name...');
    
    // Rename the column
    await client.query('ALTER TABLE kg_std_applications RENAME COLUMN child_name TO full_name;');
    
    console.log('✅ Column renamed successfully!');
    
    // Verify the rename
    const verifyResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'kg_std_applications' 
      AND table_schema = 'public'
      AND column_name IN ('child_name', 'full_name');
    `);
    
    console.log('Verification result:');
    verifyResult.rows.forEach(row => {
      console.log(`- Found column: ${row.column_name}`);
    });
    
    const finalHasFullName = verifyResult.rows.some(row => row.column_name === 'full_name');
    const finalHasChildName = verifyResult.rows.some(row => row.column_name === 'child_name');
    
    if (finalHasFullName && !finalHasChildName) {
      console.log('🎉 Migration completed successfully!');
    } else {
      console.log('⚠️ Migration may not have completed as expected');
    }
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

// Run the migration
renameColumn()
  .then(() => {
    console.log('Migration script completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration script failed:', error.message);
    process.exit(1);
  });