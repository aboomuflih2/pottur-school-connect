import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use anon key like the frontend does
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

console.log('🧪 Testing Complete Workflow for News, Events, and Gallery...');
console.log('=' .repeat(60));

// Test user authentication first
console.log('\n1️⃣ Testing User Authentication...');
let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'admin@pottur.com',
  password: 'admin123'
});

let signUpData = null;
if (authError) {
  console.log('❌ Auth failed:', authError.message);
  console.log('Creating test user...');
  
  const { data: newSignUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'admin@pottur.com',
    password: 'admin123'
  });
  
  if (signUpError) {
    console.log('❌ Sign up failed:', signUpError.message);
    process.exit(1);
  }
  
  signUpData = newSignUpData;
  console.log('✅ Test user created successfully');
} else {
  console.log('✅ Authentication successful');
}

const userId = authData?.user?.id || signUpData?.user?.id;
if (!userId) {
  console.log('❌ No user ID available');
  process.exit(1);
}

console.log('👤 User ID:', userId);

// Test 1: News Posts
console.log('\n2️⃣ Testing News Posts...');
const newsData = {
  title: 'Test News Article',
  content: 'This is a test news article content.',
  excerpt: 'Test excerpt for the news article',
  author_id: userId,
  is_published: true,
  published_at: new Date().toISOString(),
  slug: 'test-news-article'
};

const { data: newsResult, error: newsError } = await supabase
  .from('news_posts')
  .insert(newsData)
  .select();

if (newsError) {
  console.log('❌ News insert failed:', newsError.message);
} else {
  console.log('✅ News article created successfully');
  console.log('📰 Article ID:', newsResult[0]?.id);
}

// Test 2: Events
console.log('\n3️⃣ Testing Events...');
const eventData = {
  title: 'Test School Event',
  description: 'This is a test school event description.',
  event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  location: 'School Auditorium',
  is_published: true
};

const { data: eventResult, error: eventError } = await supabase
  .from('events')
  .insert(eventData)
  .select();

if (eventError) {
  console.log('❌ Event insert failed:', eventError.message);
} else {
  console.log('✅ Event created successfully');
  console.log('📅 Event ID:', eventResult[0]?.id);
}

// Test 3: Gallery Photos
console.log('\n4️⃣ Testing Gallery Photos...');
const galleryData = {
  image_url: 'https://picsum.photos/800/600?random=1',
  title: 'Test Gallery Photo',
  description: 'This is a test gallery photo description.',
  category: 'test'
};

const { data: galleryResult, error: galleryError } = await supabase
  .from('gallery_photos')
  .insert(galleryData)
  .select();

if (galleryError) {
  console.log('❌ Gallery insert failed:', galleryError.message);
} else {
  console.log('✅ Gallery photo created successfully');
  console.log('🖼️ Photo ID:', galleryResult[0]?.id);
}

// Test 4: Verify data retrieval
console.log('\n5️⃣ Testing Data Retrieval...');

// Check news posts
const { data: allNews, error: newsRetrieveError } = await supabase
  .from('news_posts')
  .select('*')
  .limit(5);

if (newsRetrieveError) {
  console.log('❌ News retrieval failed:', newsRetrieveError.message);
} else {
  console.log(`✅ Retrieved ${allNews?.length || 0} news articles`);
}

// Check events
const { data: allEvents, error: eventsRetrieveError } = await supabase
  .from('events')
  .select('*')
  .limit(5);

if (eventsRetrieveError) {
  console.log('❌ Events retrieval failed:', eventsRetrieveError.message);
} else {
  console.log(`✅ Retrieved ${allEvents?.length || 0} events`);
}

// Check gallery
const { data: allPhotos, error: galleryRetrieveError } = await supabase
  .from('gallery_photos')
  .select('*')
  .limit(5);

if (galleryRetrieveError) {
  console.log('❌ Gallery retrieval failed:', galleryRetrieveError.message);
} else {
  console.log(`✅ Retrieved ${allPhotos?.length || 0} gallery photos`);
}

// Summary
console.log('\n' + '=' .repeat(60));
console.log('📊 WORKFLOW TEST SUMMARY:');
console.log('=' .repeat(60));
console.log(`👤 Authentication: ${authError ? '❌ FAILED' : '✅ PASSED'}`);
console.log(`📰 News Posts: ${newsError ? '❌ FAILED' : '✅ PASSED'}`);
console.log(`📅 Events: ${eventError ? '❌ FAILED' : '✅ PASSED'}`);
console.log(`🖼️ Gallery: ${galleryError ? '❌ FAILED' : '✅ PASSED'}`);
console.log(`📖 Data Retrieval: ${(newsRetrieveError || eventsRetrieveError || galleryRetrieveError) ? '❌ FAILED' : '✅ PASSED'}`);

const allTestsPassed = !authError && !newsError && !eventError && !galleryError && !newsRetrieveError && !eventsRetrieveError && !galleryRetrieveError;
console.log(`\n🎯 Overall Status: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

if (allTestsPassed) {
  console.log('\n🎉 All features are working correctly!');
  console.log('✨ Users can now:');
  console.log('   • Create and save news articles');
  console.log('   • Create and save events');
  console.log('   • Upload and save gallery photos');
} else {
  console.log('\n⚠️ Some issues still need to be addressed.');
}

// Clean up test data
console.log('\n🧹 Cleaning up test data...');
if (newsResult?.[0]?.id) {
  await supabase.from('news_posts').delete().eq('id', newsResult[0].id);
}
if (eventResult?.[0]?.id) {
  await supabase.from('events').delete().eq('id', eventResult[0].id);
}
if (galleryResult?.[0]?.id) {
  await supabase.from('gallery_photos').delete().eq('id', galleryResult[0].id);
}
console.log('✅ Test data cleaned up');