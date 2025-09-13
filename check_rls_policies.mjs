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

console.log('🔍 Checking RLS Policies for Events and Gallery Tables...');
console.log('============================================================');

// Check RLS policies for events table
console.log('\n📅 Events Table RLS Policies:');
const { data: eventsPolicies, error: eventsError } = await supabase
  .from('pg_policies')
  .select('*')
  .eq('tablename', 'events');

if (eventsError) {
  console.log('❌ Error fetching events policies:', eventsError.message);
} else {
  console.log('✅ Events policies:', eventsPolicies.length > 0 ? eventsPolicies : 'No policies found');
}

// Check RLS policies for gallery_photos table
console.log('\n🖼️ Gallery Photos Table RLS Policies:');
const { data: galleryPolicies, error: galleryError } = await supabase
  .from('pg_policies')
  .select('*')
  .eq('tablename', 'gallery_photos');

if (galleryError) {
  console.log('❌ Error fetching gallery policies:', galleryError.message);
} else {
  console.log('✅ Gallery policies:', galleryPolicies.length > 0 ? galleryPolicies : 'No policies found');
}

// Check table permissions
console.log('\n🔐 Checking Table Permissions:');
const { data: permissions, error: permError } = await supabase
  .rpc('sql', {
    query: `
      SELECT grantee, table_name, privilege_type 
      FROM information_schema.role_table_grants 
      WHERE table_schema = 'public' 
      AND table_name IN ('events', 'gallery_photos')
      AND grantee IN ('anon', 'authenticated') 
      ORDER BY table_name, grantee;
    `
  });

if (permError) {
  console.log('❌ Error checking permissions:', permError.message);
} else {
  console.log('✅ Table permissions:', permissions);
}

console.log('\n============================================================');
console.log('🎯 RLS Policy Check Complete');