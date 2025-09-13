import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseConnectivity() {
  console.log('\n=== TESTING DATABASE CONNECTIVITY ===');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('news_posts').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    console.log('✅ Database connection successful');
    return true;
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    return false;
  }
}

async function testAdminAuthentication() {
  console.log('\n=== TESTING ADMIN AUTHENTICATION ===');
  
  try {
    // Try to sign in as admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@potturschool.com',
      password: 'admin123'
    });
    
    if (authError) {
      console.error('❌ Admin authentication failed:', authError.message);
      return false;
    }
    
    console.log('✅ Admin authentication successful');
    console.log('User ID:', authData.user?.id);
    
    // Check user role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authData.user?.id)
      .single();
    
    if (roleError) {
      console.error('❌ Failed to fetch user role:', roleError.message);
    } else {
      console.log('✅ User role:', roleData?.role);
    }
    
    return true;
  } catch (err) {
    console.error('❌ Authentication error:', err.message);
    return false;
  }
}

async function testCRUDOperations() {
  console.log('\n=== TESTING CRUD OPERATIONS ===');
  
  try {
    // Test INSERT
    console.log('Testing INSERT operation...');
    const { data: insertData, error: insertError } = await supabase
      .from('news_posts')
      .insert({
        title: 'Test Article ' + Date.now(),
        slug: 'test-article-' + Date.now(),
        excerpt: 'Test excerpt',
        content: 'Test content',
        author: 'Test Author',
        is_published: false
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ INSERT failed:', insertError.message);
      console.error('Error details:', insertError);
    } else {
      console.log('✅ INSERT successful, ID:', insertData?.id);
      
      // Test UPDATE
      console.log('Testing UPDATE operation...');
      const { error: updateError } = await supabase
        .from('news_posts')
        .update({ title: 'Updated Test Article' })
        .eq('id', insertData.id);
      
      if (updateError) {
        console.error('❌ UPDATE failed:', updateError.message);
      } else {
        console.log('✅ UPDATE successful');
      }
      
      // Test DELETE
      console.log('Testing DELETE operation...');
      const { error: deleteError } = await supabase
        .from('news_posts')
        .delete()
        .eq('id', insertData.id);
      
      if (deleteError) {
        console.error('❌ DELETE failed:', deleteError.message);
      } else {
        console.log('✅ DELETE successful');
      }
    }
    
    // Test SELECT
    console.log('Testing SELECT operation...');
    const { data: selectData, error: selectError } = await supabase
      .from('news_posts')
      .select('id, title, author')
      .limit(5);
    
    if (selectError) {
      console.error('❌ SELECT failed:', selectError.message);
    } else {
      console.log('✅ SELECT successful, found', selectData?.length, 'records');
    }
    
  } catch (err) {
    console.error('❌ CRUD operations error:', err.message);
  }
}

async function testTablePermissions() {
  console.log('\n=== TESTING TABLE PERMISSIONS ===');
  
  const tables = ['news_posts', 'events', 'academic_programs', 'user_roles'];
  
  for (const table of tables) {
    try {
      console.log(`Testing ${table}...`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Access granted`);
      }
    } catch (err) {
      console.error(`❌ ${table}: ${err.message}`);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Admin Dashboard Database Tests...');
  
  const connectivityOk = await testDatabaseConnectivity();
  if (!connectivityOk) {
    console.log('\n❌ Database connectivity failed. Stopping tests.');
    return;
  }
  
  const authOk = await testAdminAuthentication();
  if (!authOk) {
    console.log('\n❌ Admin authentication failed. Continuing with anonymous tests...');
  }
  
  await testCRUDOperations();
  await testTablePermissions();
  
  console.log('\n🏁 All tests completed!');
  
  // Sign out
  await supabase.auth.signOut();
}

runAllTests().catch(console.error);