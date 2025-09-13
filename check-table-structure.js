import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableStructure() {
  try {
    console.log('Checking academic_programs table structure...');
    
    // Try to select all columns to see what exists
    const { data, error } = await supabase
      .from('academic_programs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error selecting from table:', error);
      return;
    }
    
    console.log('Table exists and is accessible');
    console.log('Sample data structure:', data);
    
    // Try to insert a minimal record to see what columns are required
    console.log('\nTesting minimal insert...');
    const { data: insertData, error: insertError } = await supabase
      .from('academic_programs')
      .insert({ id: 999, test: 'test' })
      .select();
    
    if (insertError) {
      console.log('Insert error (this helps us understand the schema):', insertError);
    } else {
      console.log('Unexpected success with minimal insert:', insertData);
      // Clean up test record
      await supabase.from('academic_programs').delete().eq('id', 999);
    }
    
    // Try different column combinations based on what we've seen in the code
    const testColumns = [
      'id',
      'program_title', 
      'title',
      'name',
      'main_image',
      'icon_image',
      'short_description',
      'description',
      'full_description',
      'subjects',
      'duration',
      'is_active',
      'active',
      'display_order',
      'order',
      'created_at',
      'updated_at'
    ];
    
    console.log('\nTesting individual columns...');
    for (const column of testColumns) {
      try {
        const { error: colError } = await supabase
          .from('academic_programs')
          .select(column)
          .limit(1);
        
        if (!colError) {
          console.log(`✓ Column '${column}' exists`);
        }
      } catch (err) {
        // Column doesn't exist, skip
      }
    }
    
  } catch (err) {
    console.error('Script error:', err);
  }
}

checkTableStructure();