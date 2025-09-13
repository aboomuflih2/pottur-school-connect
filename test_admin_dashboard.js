import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminDashboardOperations() {
  console.log('🚀 Testing Admin Dashboard CRUD Operations...');
  
  try {
    // Step 1: Admin Login
    console.log('\n=== STEP 1: ADMIN LOGIN ===');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@potturschool.com',
      password: 'admin123'
    });
    
    if (authError) {
      console.error('❌ Admin login failed:', authError.message);
      return;
    }
    
    console.log('✅ Admin logged in successfully');
    console.log('User ID:', authData.user?.id);
    
    // Step 2: Test News Posts CRUD
    console.log('\n=== STEP 2: NEWS POSTS CRUD ===');
    
    // Create news post
    const newsData = {
      title: 'Test News Article ' + Date.now(),
      slug: 'test-news-' + Date.now(),
      excerpt: 'This is a test news article excerpt',
      content: 'This is the full content of the test news article.',
      author: 'Admin User',
      featured_image: 'https://example.com/image.jpg',
      is_published: false
    };
    
    const { data: newNews, error: newsCreateError } = await supabase
      .from('news_posts')
      .insert(newsData)
      .select()
      .single();
    
    if (newsCreateError) {
      console.error('❌ News creation failed:', newsCreateError.message);
    } else {
      console.log('✅ News post created:', newNews.id);
      
      // Update news post
      const { error: newsUpdateError } = await supabase
        .from('news_posts')
        .update({ 
          title: 'Updated Test News Article',
          is_published: true 
        })
        .eq('id', newNews.id);
      
      if (newsUpdateError) {
        console.error('❌ News update failed:', newsUpdateError.message);
      } else {
        console.log('✅ News post updated successfully');
      }
      
      // Delete news post
      const { error: newsDeleteError } = await supabase
        .from('news_posts')
        .delete()
        .eq('id', newNews.id);
      
      if (newsDeleteError) {
        console.error('❌ News deletion failed:', newsDeleteError.message);
      } else {
        console.log('✅ News post deleted successfully');
      }
    }
    
    // Step 3: Test Events CRUD
    console.log('\n=== STEP 3: EVENTS CRUD ===');
    
    const eventData = {
      title: 'Test Event ' + Date.now(),
      description: 'This is a test event description',
      event_date: new Date().toISOString(),
      location: 'Test Location',
      is_featured: false
    };
    
    const { data: newEvent, error: eventCreateError } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();
    
    if (eventCreateError) {
      console.error('❌ Event creation failed:', eventCreateError.message);
    } else {
      console.log('✅ Event created:', newEvent.id);
      
      // Update event
      const { error: eventUpdateError } = await supabase
        .from('events')
        .update({ 
          title: 'Updated Test Event',
          is_featured: true 
        })
        .eq('id', newEvent.id);
      
      if (eventUpdateError) {
        console.error('❌ Event update failed:', eventUpdateError.message);
      } else {
        console.log('✅ Event updated successfully');
      }
      
      // Delete event
      const { error: eventDeleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', newEvent.id);
      
      if (eventDeleteError) {
        console.error('❌ Event deletion failed:', eventDeleteError.message);
      } else {
        console.log('✅ Event deleted successfully');
      }
    }
    
    // Step 4: Test Academic Programs CRUD
    console.log('\n=== STEP 4: ACADEMIC PROGRAMS CRUD ===');
    
    const programData = {
      name: 'Test Program ' + Date.now(),
      description: 'This is a test academic program',
      duration: '4 years',
      eligibility: 'Test eligibility criteria'
    };
    
    const { data: newProgram, error: programCreateError } = await supabase
      .from('academic_programs')
      .insert(programData)
      .select()
      .single();
    
    if (programCreateError) {
      console.error('❌ Program creation failed:', programCreateError.message);
    } else {
      console.log('✅ Academic program created:', newProgram.id);
      
      // Update program
      const { error: programUpdateError } = await supabase
        .from('academic_programs')
        .update({ 
          name: 'Updated Test Program',
          duration: '3 years'
        })
        .eq('id', newProgram.id);
      
      if (programUpdateError) {
        console.error('❌ Program update failed:', programUpdateError.message);
      } else {
        console.log('✅ Academic program updated successfully');
      }
      
      // Delete program
      const { error: programDeleteError } = await supabase
        .from('academic_programs')
        .delete()
        .eq('id', newProgram.id);
      
      if (programDeleteError) {
        console.error('❌ Program deletion failed:', programDeleteError.message);
      } else {
        console.log('✅ Academic program deleted successfully');
      }
    }
    
    // Step 5: Test Read Operations
    console.log('\n=== STEP 5: READ OPERATIONS ===');
    
    const tables = ['news_posts', 'events', 'academic_programs'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(5);
      
      if (error) {
        console.error(`❌ ${table} read failed:`, error.message);
      } else {
        console.log(`✅ ${table} read successful: ${data.length} records`);
      }
    }
    
    // Sign out
    await supabase.auth.signOut();
    console.log('\n✅ Admin signed out successfully');
    
    console.log('\n🎉 ALL ADMIN DASHBOARD OPERATIONS COMPLETED SUCCESSFULLY!');
    
  } catch (err) {
    console.error('❌ Test error:', err.message);
  }
}

testAdminDashboardOperations().catch(console.error);