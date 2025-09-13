import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54323',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

console.log('Checking table structures...');

// Check news_posts table
console.log('\n=== NEWS_POSTS TABLE ===');
const { data: newsData, error: newsError } = await supabase
  .from('news_posts')
  .select('*')
  .limit(1);

if (newsError) {
  console.log('News posts error:', newsError.message);
} else {
  console.log('News posts sample:', newsData?.[0] ? Object.keys(newsData[0]) : 'No data');
}

// Check events table
console.log('\n=== EVENTS TABLE ===');
const { data: eventsData, error: eventsError } = await supabase
  .from('events')
  .select('*')
  .limit(1);

if (eventsError) {
  console.log('Events error:', eventsError.message);
} else {
  console.log('Events sample:', eventsData?.[0] ? Object.keys(eventsData[0]) : 'No data');
}

// Check gallery_photos table
console.log('\n=== GALLERY_PHOTOS TABLE ===');
const { data: galleryData, error: galleryError } = await supabase
  .from('gallery_photos')
  .select('*')
  .limit(1);

if (galleryError) {
  console.log('Gallery photos error:', galleryError.message);
} else {
  console.log('Gallery photos sample:', galleryData?.[0] ? Object.keys(galleryData[0]) : 'No data');
}

// Test insert with minimal data
console.log('\n=== TESTING INSERTS ===');

// Test news_posts insert with minimal fields
const { error: newsInsertError } = await supabase
  .from('news_posts')
  .insert({
    title: 'Test News',
    content: 'Test content',
    author_id: 'test-author'
  });

console.log('News insert result:', newsInsertError ? 'ERROR: ' + newsInsertError.message : 'SUCCESS');

// Test events insert with minimal fields
const { error: eventsInsertError } = await supabase
  .from('events')
  .insert({
    title: 'Test Event',
    description: 'Test description',
    event_date: new Date().toISOString()
  });

console.log('Events insert result:', eventsInsertError ? 'ERROR: ' + eventsInsertError.message : 'SUCCESS');

// Test gallery_photos insert with minimal fields
const { error: galleryInsertError } = await supabase
  .from('gallery_photos')
  .insert({
    image_url: 'https://example.com/test.jpg',
    title: 'Test Photo'
  });

console.log('Gallery insert result:', galleryInsertError ? 'ERROR: ' + galleryInsertError.message : 'SUCCESS');