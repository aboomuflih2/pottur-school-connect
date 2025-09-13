import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPoliciesAndPermissions() {
  console.log('🔍 Checking RLS Policies and Permissions...');
  console.log('================================================');

  try {
    // Check if RLS is enabled on tables
    console.log('\n📋 Checking RLS status...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('exec_sql', { 
        query: `
          SELECT schemaname, tablename, rowsecurity 
          FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename IN ('events', 'gallery_photos', 'news_posts')
          ORDER BY tablename;
        `
      });
    
    if (rlsError) {
      console.log('❌ RLS status check failed:', rlsError.message);
    } else {
      console.log('✅ RLS Status:', rlsStatus);
    }

    // Check table permissions for anon and authenticated roles
    console.log('\n🔐 Checking table permissions...');
    const { data: permissions, error: permError } = await supabase
      .rpc('exec_sql', { 
        query: `
          SELECT grantee, table_name, privilege_type 
          FROM information_schema.role_table_grants 
          WHERE table_schema = 'public' 
          AND table_name IN ('events', 'gallery_photos', 'news_posts')
          AND grantee IN ('anon', 'authenticated') 
          ORDER BY table_name, grantee;
        `
      });
    
    if (permError) {
      console.log('❌ Permissions check failed:', permError.message);
    } else {
      console.log('✅ Table Permissions:', permissions);
    }

    // Try direct insert test with authenticated user
    console.log('\n🧪 Testing direct insert with authenticated user...');
    
    // First, get a test user session
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@potturschool.com',
      password: 'admin123'
    });
    
    if (authError) {
      console.log('❌ Auth failed:', authError.message);
      return;
    }
    
    console.log('✅ Authenticated as:', authData.user.email);
    
    // Test events insert
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert({
        title: 'Test Event Direct',
        description: 'Direct insert test',
        event_date: new Date().toISOString(),
        location: 'Test Location'
      })
      .select();
    
    if (eventError) {
      console.log('❌ Events insert failed:', eventError.message);
    } else {
      console.log('✅ Events insert successful:', eventData);
      
      // Clean up
      await supabase.from('events').delete().eq('id', eventData[0].id);
    }
    
    // Test gallery insert
    const { data: galleryData, error: galleryError } = await supabase
      .from('gallery_photos')
      .insert({
        image_url: 'https://example.com/test.jpg',
        title: 'Test Photo Direct',
        description: 'Direct insert test',
        display_order: 1
      })
      .select();
    
    if (galleryError) {
      console.log('❌ Gallery insert failed:', galleryError.message);
    } else {
      console.log('✅ Gallery insert successful:', galleryData);
      
      // Clean up
      await supabase.from('gallery_photos').delete().eq('id', galleryData[0].id);
    }
    
  } catch (error) {
    console.error('❌ Error during policy check:', error);
  }
}

checkPoliciesAndPermissions();