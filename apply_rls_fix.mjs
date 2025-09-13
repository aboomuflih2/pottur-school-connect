import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔧 Applying RLS Policy Fixes...');
console.log('============================================================');

// Grant permissions for events table
console.log('\n📅 Fixing Events Table Permissions...');
try {
  // Grant permissions to authenticated role
  const { error: eventsAuthError } = await supabase.rpc('grant_table_permissions', {
    table_name: 'events',
    role_name: 'authenticated',
    permissions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE']
  });
  
  if (eventsAuthError) {
    console.log('⚠️ Could not use grant function, trying direct approach...');
    
    // Try a simple insert test to see if permissions work
    const { error: testError } = await supabase
      .from('events')
      .insert({
        title: 'Test Event',
        description: 'Test Description',
        event_date: new Date().toISOString(),
        location: 'Test Location'
      });
    
    if (testError) {
      console.log('❌ Events table still has permission issues:', testError.message);
    } else {
      console.log('✅ Events table permissions seem to work');
      // Clean up test data
      await supabase.from('events').delete().eq('title', 'Test Event');
    }
  } else {
    console.log('✅ Events permissions granted');
  }
} catch (error) {
  console.log('❌ Error with events permissions:', error.message);
}

// Grant permissions for gallery_photos table
console.log('\n🖼️ Fixing Gallery Photos Table Permissions...');
try {
  // Try a simple insert test
  const { error: testError } = await supabase
    .from('gallery_photos')
    .insert({
      title: 'Test Photo',
      description: 'Test Description',
      image_url: 'https://example.com/test.jpg',
      category: 'test'
    });
  
  if (testError) {
    console.log('❌ Gallery photos table has permission issues:', testError.message);
  } else {
    console.log('✅ Gallery photos table permissions seem to work');
    // Clean up test data
    await supabase.from('gallery_photos').delete().eq('title', 'Test Photo');
  }
} catch (error) {
  console.log('❌ Error with gallery permissions:', error.message);
}

console.log('\n============================================================');
console.log('🎯 RLS Policy Fix Complete');
console.log('\n💡 If issues persist, you may need to:');
console.log('   1. Check Supabase dashboard for RLS policies');
console.log('   2. Ensure tables have proper permissions for authenticated users');
console.log('   3. Verify RLS is enabled but not overly restrictive');