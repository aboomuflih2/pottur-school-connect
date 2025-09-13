import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:55001';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('VITE_SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseRelationships() {
  try {
    console.log('Testing database relationships and structure...');
    
    // Test 1: Check if we can query news_posts
    console.log('\n1. Testing news_posts table...');
    const { data: newsPosts, error: newsError } = await supabase
      .from('news_posts')
      .select('id, title, published_at, author_id')
      .limit(3);
    
    if (newsError) {
      console.error('News posts query failed:', newsError);
    } else {
      console.log('News posts found:', newsPosts?.length || 0);
      if (newsPosts && newsPosts.length > 0) {
        console.log('Sample news post:', newsPosts[0]);
      }
    }
    
    // Test 2: Check if we can query article_comments
    console.log('\n2. Testing article_comments table...');
    const { data: comments, error: commentsError } = await supabase
      .from('article_comments')
      .select('id, article_id, author_name, comment_content')
      .limit(3);
    
    if (commentsError) {
      console.error('Comments query failed:', commentsError);
    } else {
      console.log('Comments found:', comments?.length || 0);
      if (comments && comments.length > 0) {
        console.log('Sample comment:', comments[0]);
      }
    }
    
    // Test 3: Check if we can query article_likes
    console.log('\n3. Testing article_likes table...');
    const { data: likes, error: likesError } = await supabase
      .from('article_likes')
      .select('id, article_id, user_ip')
      .limit(3);
    
    if (likesError) {
      console.error('Likes query failed:', likesError);
    } else {
      console.log('Likes found:', likes?.length || 0);
      if (likes && likes.length > 0) {
        console.log('Sample like:', likes[0]);
      }
    }
    
    // Test 4: Try to query with joins (this will fail if foreign keys don't exist)
    console.log('\n4. Testing join relationships...');
    const { data: joinTest, error: joinError } = await supabase
      .from('news_posts')
      .select(`
        id,
        title,
        article_comments(id, comment_content, author_name),
        article_likes(id)
      `)
      .limit(1);
    
    if (joinError) {
      console.error('Join test failed (foreign keys may not exist):', joinError.message);
    } else {
      console.log('Join test successful! Foreign keys are working.');
      console.log('Sample joined data:', JSON.stringify(joinTest, null, 2));
    }
    
    // Test 5: Check NewsManager query compatibility
    console.log('\n5. Testing NewsManager query compatibility...');
    const { data: newsManagerTest, error: newsManagerError } = await supabase
      .from('news_posts')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(1);
    
    if (newsManagerError) {
      console.error('NewsManager query failed:', newsManagerError);
    } else {
      console.log('NewsManager query successful!');
      if (newsManagerTest && newsManagerTest.length > 0) {
        const post = newsManagerTest[0];
        console.log('Post structure check:');
        console.log('- Has published_at:', !!post.published_at);
        console.log('- Has author_id:', !!post.author_id);
        console.log('- Has title:', !!post.title);
        console.log('- Has content:', !!post.content);
      }
    }
    
    console.log('\nDatabase relationship test completed!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDatabaseRelationships();