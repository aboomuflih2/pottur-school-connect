import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use local Supabase instance
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54323';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminLogin() {
  try {
    console.log('Testing admin login for web.modernhss@gmail.com...');
    
    const email = 'web.modernhss@gmail.com';
    const password = 'Modern#2025';
    
    // Test login
    console.log('Attempting to sign in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (authError) {
      console.error('Login failed:', authError.message);
      return;
    }
    
    console.log('Login successful!');
    console.log('User ID:', authData.user.id);
    console.log('Email:', authData.user.email);
    
    // Check user role
    console.log('\nChecking user role...');
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (roleError) {
      console.error('Error fetching user role:', roleError.message);
      return;
    }
    
    console.log('User role:', roleData.role);
    
    if (roleData.role === 'admin') {
      console.log('\n✅ SUCCESS: User has admin privileges!');
      
      // Test admin functionality - try to fetch hero slides
      console.log('\nTesting admin access to hero slides...');
      const { data: heroSlides, error: heroError } = await supabase
        .from('hero_slides')
        .select('*');
      
      if (heroError) {
        console.error('Error accessing hero slides:', heroError.message);
      } else {
        console.log(`Successfully accessed hero slides (${heroSlides.length} slides found)`);
      }
      
      // Test admin functionality - try to fetch news posts
      console.log('\nTesting admin access to news posts...');
      const { data: newsPosts, error: newsError } = await supabase
        .from('news_posts')
        .select('*');
      
      if (newsError) {
        console.error('Error accessing news posts:', newsError.message);
      } else {
        console.log(`Successfully accessed news posts (${newsPosts.length} posts found)`);
      }
      
    } else {
      console.log('❌ FAILED: User does not have admin privileges');
    }
    
    // Sign out
    await supabase.auth.signOut();
    console.log('\nSigned out successfully');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testAdminLogin();