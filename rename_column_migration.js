import { createClient } from '@supabase/supabase-js';

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function renameColumn() {
  try {
    console.log('Starting column rename migration...');
    
    // First, check if the table exists and get current schema
    const { data: tableInfo, error: tableError } = await supabase
      .from('kg_std_applications')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Error checking table:', tableError);
      return;
    }
    
    console.log('Table exists, proceeding with column rename...');
    
    // Execute the ALTER TABLE command to rename column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE "kg_std_applications" RENAME COLUMN "child_name" TO "full_name";'
    });
    
    if (error) {
      console.error('Error renaming column:', error);
      
      // Try alternative approach using direct SQL
      console.log('Trying alternative approach...');
      const { data: altData, error: altError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'kg_std_applications')
        .eq('table_schema', 'public');
      
      if (altError) {
        console.error('Error checking columns:', altError);
      } else {
        console.log('Current columns:', altData);
      }
      
      return;
    }
    
    console.log('Column renamed successfully!');
    
    // Verify the rename was successful
    const { data: verifyData, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'kg_std_applications')
      .eq('table_schema', 'public');
    
    if (verifyError) {
      console.error('Error verifying rename:', verifyError);
    } else {
      console.log('Updated columns:', verifyData.map(col => col.column_name));
      
      const hasFullName = verifyData.some(col => col.column_name === 'full_name');
      const hasChildName = verifyData.some(col => col.column_name === 'child_name');
      
      if (hasFullName && !hasChildName) {
        console.log('✅ Column rename successful: child_name → full_name');
      } else if (hasChildName && !hasFullName) {
        console.log('❌ Column rename failed: child_name still exists');
      } else if (hasFullName && hasChildName) {
        console.log('⚠️ Both columns exist - manual cleanup needed');
      } else {
        console.log('❓ Neither column found - check table structure');
      }
    }
    
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

// Run the migration
renameColumn().then(() => {
  console.log('Migration script completed.');
  process.exit(0);
}).catch(err => {
  console.error('Migration script failed:', err);
  process.exit(1);
});