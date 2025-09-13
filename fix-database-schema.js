import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://127.0.0.1:55001';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkAndFixSchema() {
  console.log('🔧 Checking and fixing database schema...');
  
  try {
    // 1. Check current news_posts structure
    console.log('📋 Checking news_posts table structure...');
    const { data: newsData, error: newsError } = await supabase
      .from('news_posts')
      .select('*')
      .limit(1);
    
    if (newsError) {
      console.error('❌ Error accessing news_posts:', newsError);
      return;
    }
    
    console.log('✅ news_posts accessible');
    if (newsData && newsData.length > 0) {
      const columns = Object.keys(newsData[0]);
      console.log('📊 Current columns:', columns);
      
      if (!columns.includes('publication_date')) {
        console.log('⚠️  publication_date column is missing');
      } else {
        console.log('✅ publication_date column exists');
      }
      
      if (!columns.includes('author')) {
        console.log('⚠️  author column is missing');
      } else {
        console.log('✅ author column exists');
      }
    }
    
    // 2. Check article_comments structure and relationship
    console.log('📋 Checking article_comments table...');
    const { data: commentsData, error: commentsError } = await supabase
      .from('article_comments')
      .select('*')
      .limit(1);
    
    if (commentsError) {
      console.error('❌ Error accessing article_comments:', commentsError);
    } else {
      console.log('✅ article_comments accessible');
      if (commentsData && commentsData.length > 0) {
        const commentColumns = Object.keys(commentsData[0]);
        console.log('📊 Comment columns:', commentColumns);
      }
    }
    
    // 3. Test the join relationship
    console.log('🔗 Testing join relationship...');
    const { data: joinData, error: joinError } = await supabase
      .from('article_comments')
      .select(`
        id,
        article_id,
        comment_content,
        news_posts!inner(id, title)
      `)
      .limit(1);
    
    if (joinError) {
      console.error('❌ Join relationship error:', joinError);
      console.log('🔧 This indicates the foreign key relationship needs fixing');
    } else {
      console.log('✅ Join relationship working correctly');
    }
    
    // 4. Test NewsManager queries
    console.log('🧪 Testing NewsManager-style queries...');
    
    // Test the query that NewsManager uses
    const { data: newsManagerData, error: newsManagerError } = await supabase
      .from('news_posts')
      .select('*')
      .order('publication_date', { ascending: false });
    
    if (newsManagerError) {
      console.error('❌ NewsManager query failed:', newsManagerError);
      
      // Try with published_at instead
      console.log('🔄 Trying with published_at column...');
      const { data: altData, error: altError } = await supabase
        .from('news_posts')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (altError) {
        console.error('❌ Alternative query also failed:', altError);
      } else {
        console.log('✅ Query works with published_at column');
        console.log('🔧 NewsManager should use published_at instead of publication_date');
      }
    } else {
      console.log('✅ NewsManager query works with publication_date');
    }
    
    // 5. Check permissions
    console.log('🔐 Testing permissions...');
    const anonClient = createClient(SUPABASE_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOuoJylzDVYXBjLz1KHfJg0P8VikdCp6ygk4');
    
    const { data: publicData, error: publicError } = await anonClient
      .from('news_posts')
      .select('*')
      .eq('is_published', true)
      .limit(1);
    
    if (publicError) {
      console.error('❌ Public access error:', publicError);
    } else {
      console.log('✅ Public access working');
    }
    
    console.log('🎉 Schema check completed!');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the check
checkAndFixSchema().then(() => {
  console.log('✨ All done!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Failed:', error);
  process.exit(1);
});