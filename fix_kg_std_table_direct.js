import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixKgStdTable() {
  console.log('🚀 Fixing KG & STD Applications Table...');
  console.log('==========================================');

  try {
    // Check current table structure
    console.log('🔍 Checking current table structure...');
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('kg_std_applications')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error accessing table:', sampleError.message);
      return;
    }
    
    const columns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
    console.log('📋 Current columns:', columns);
    
    // Check if we need to rename child_name to full_name
    if (columns.includes('child_name') && !columns.includes('full_name')) {
      console.log('🔄 Renaming child_name column to full_name...');
      
      // Use a direct PostgreSQL query through the REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          sql: 'ALTER TABLE public.kg_std_applications RENAME COLUMN child_name TO full_name;'
        })
      });
      
      if (!response.ok) {
        // Try alternative approach - add full_name column and copy data
        console.log('⚠️ Direct rename failed, trying alternative approach...');
        
        try {
          // Add full_name column
          const addColumnResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({
              sql: 'ALTER TABLE public.kg_std_applications ADD COLUMN full_name TEXT;'
            })
          });
          
          if (addColumnResponse.ok) {
            console.log('✅ Added full_name column');
            
            // Copy data from child_name to full_name
            const copyDataResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey
              },
              body: JSON.stringify({
                sql: 'UPDATE public.kg_std_applications SET full_name = child_name WHERE child_name IS NOT NULL;'
              })
            });
            
            if (copyDataResponse.ok) {
              console.log('✅ Copied data from child_name to full_name');
            }
          }
        } catch (altError) {
          console.log('⚠️ Alternative approach also failed, but continuing...');
        }
      } else {
        console.log('✅ Successfully renamed child_name to full_name');
      }
    } else if (columns.includes('full_name')) {
      console.log('✅ full_name column already exists');
    } else {
      console.log('➕ Adding full_name column...');
      
      try {
        const addResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            sql: 'ALTER TABLE public.kg_std_applications ADD COLUMN full_name TEXT;'
          })
        });
        
        if (addResponse.ok) {
          console.log('✅ Added full_name column');
        }
      } catch (addError) {
        console.log('⚠️ Could not add full_name column via API');
      }
    }
    
    // Final verification
    console.log('\n🔍 Final verification...');
    const { data: finalCheck, error: finalError } = await supabase
      .from('kg_std_applications')
      .select('*')
      .limit(1);
    
    if (finalError) {
      console.error('❌ Final verification failed:', finalError.message);
    } else {
      const finalColumns = finalCheck && finalCheck.length > 0 ? Object.keys(finalCheck[0]) : [];
      console.log('📋 Final columns:', finalColumns);
      
      if (finalColumns.includes('full_name')) {
        console.log('✅ full_name column is now available!');
        console.log('🎉 KG & STD Applications table is ready!');
      } else {
        console.log('❌ full_name column is still missing');
        console.log('💡 The frontend may need to use "child_name" instead of "full_name"');
      }
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

fixKgStdTable();