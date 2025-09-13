import { createClient } from '@supabase/supabase-js';

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54323';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableSchema() {
  try {
    console.log('Checking academic_programs table schema...');
    
    // Try to select all columns from the table to see what exists
    const { data, error } = await supabase
      .from('academic_programs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching from academic_programs:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Current academic_programs table columns:');
      Object.keys(data[0]).forEach(col => {
        console.log(`- ${col}`);
      });
      
      // Check if category column exists
      if ('category' in data[0]) {
        console.log('\n✅ Category column exists!');
      } else {
        console.log('\n❌ Category column is missing!');
      }
    } else {
      console.log('Table exists but is empty. Let me try to insert test data to see what columns are expected...');
      
      // Try inserting with category to see if it fails
      const testData = {
        program_name: 'Test Program',
        category: 'Test Category',
        is_active: true,
        display_order: 1
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('academic_programs')
        .insert([testData])
        .select();
      
      if (insertError) {
        console.log('\n❌ Category column is missing! Error:', insertError.message);
      } else {
        console.log('\n✅ Category column exists! Test insert successful.');
        // Clean up
        await supabase.from('academic_programs').delete().eq('id', insertData[0].id);
      }
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkTableSchema();