import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixStaffCountsTable() {
  console.log('🔧 Fixing staff_counts table...');
  console.log('=' .repeat(50));

  try {
    // 1. Check current staff_counts data
    console.log('\n1. Checking current staff_counts data...');
    const { data: allCounts, error: fetchError } = await supabase
      .from('staff_counts')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching staff counts:', fetchError.message);
      return;
    }
    
    console.log('Current staff_counts rows:', allCounts.length);
    console.log('Data:', allCounts);

    // 2. If no data exists, insert initial data
    if (allCounts.length === 0) {
      console.log('\n2. No staff counts data found. Inserting initial data...');
      const initialData = {
        teaching_staff: 20,
        security_staff: 4,
        professional_staff: 12,
        guides_staff: 2
      };
      
      const { data: insertedData, error: insertError } = await supabase
        .from('staff_counts')
        .insert([initialData])
        .select();
      
      if (insertError) {
        console.error('❌ Error inserting initial data:', insertError.message);
      } else {
        console.log('✅ Initial staff counts data inserted:', insertedData[0]);
      }
    } else if (allCounts.length > 1) {
      console.log('\n2. Multiple staff_counts rows found. Keeping only the first one...');
      
      // Keep the first row, delete the rest
      const firstRow = allCounts[0];
      const rowsToDelete = allCounts.slice(1);
      
      for (const row of rowsToDelete) {
        const { error: deleteError } = await supabase
          .from('staff_counts')
          .delete()
          .eq('id', row.id);
        
        if (deleteError) {
          console.error(`❌ Error deleting row ${row.id}:`, deleteError.message);
        } else {
          console.log(`✅ Deleted duplicate row ${row.id}`);
        }
      }
      
      console.log('✅ Kept row:', firstRow);
    } else {
      console.log('\n2. Single staff_counts row found. Table is properly configured.');
    }

    // 3. Test the .single() method now
    console.log('\n3. Testing .single() method...');
    const { data: singleData, error: singleError } = await supabase
      .from('staff_counts')
      .select('*')
      .single();
    
    if (singleError) {
      console.error('❌ Error with .single() method:', singleError.message);
    } else {
      console.log('✅ .single() method works correctly:', singleData);
    }

    // 4. Test the problematic ID fetch logic from AboutPage
    console.log('\n4. Testing the AboutPage ID fetch logic...');
    const { data: idData, error: idError } = await supabase
      .from('staff_counts')
      .select('id')
      .single();
    
    if (idError) {
      console.error('❌ AboutPage ID fetch still fails:', idError.message);
    } else {
      console.log('✅ AboutPage ID fetch works:', idData.id);
      
      // Test update with this ID
      const testUpdate = {
        teaching_staff: 25,
        security_staff: 5,
        professional_staff: 15,
        guides_staff: 3
      };
      
      const { error: updateError } = await supabase
        .from('staff_counts')
        .update(testUpdate)
        .eq('id', idData.id);
      
      if (updateError) {
        console.error('❌ Update test failed:', updateError.message);
      } else {
        console.log('✅ Update test successful');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixStaffCountsTable().then(() => {
  console.log('\n🏁 Staff counts table fix completed!');
}).catch(error => {
  console.error('💥 Fix failed:', error);
});