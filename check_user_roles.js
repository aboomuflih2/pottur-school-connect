import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserRoles() {
  console.log('🔍 Checking user_roles table...');
  console.log('============================================================');
  
  try {
    // Check if table exists and get all data
    const { data, error } = await supabase
      .from('user_roles')
      .select('*');
    
    if (error) {
      console.log('❌ Error querying user_roles:', error);
      return;
    }
    
    console.log('✅ user_roles table data:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check for specific admin user
    const adminUserId = 'cad03ac2-04de-4a3b-bb4b-c5c735cd548c';
    const adminRole = data.find(role => role.user_id === adminUserId && role.role === 'admin');
    
    if (adminRole) {
      console.log('✅ Admin role found for user:', adminUserId);
    } else {
      console.log('❌ No admin role found for user:', adminUserId);
      
      // Try to create admin role
      console.log('\n🔧 Creating admin role...');
      const { data: insertData, error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: adminUserId,
          role: 'admin'
        })
        .select();
      
      if (insertError) {
        console.log('❌ Error creating admin role:', insertError);
      } else {
        console.log('✅ Admin role created:', insertData);
      }
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

checkUserRoles();