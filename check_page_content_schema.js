import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPageContentSchema() {
  console.log('🔍 Checking page_content table schema...');
  console.log('=' .repeat(50));

  try {
    // Try to get all data from page_content to see the actual structure
    console.log('\n1. Checking existing page_content data...');
    const { data: pageContentData, error: pageContentError } = await supabase
      .from('page_content')
      .select('*');
    
    if (pageContentError) {
      console.error('❌ Error fetching page_content:', pageContentError.message);
    } else {
      console.log('✅ Page content data found:', pageContentData.length, 'rows');
      if (pageContentData.length > 0) {
        console.log('\n📋 Sample row structure:');
        console.log(JSON.stringify(pageContentData[0], null, 2));
        console.log('\n🔑 Available columns:', Object.keys(pageContentData[0]));
      } else {
        console.log('📝 Table exists but is empty');
      }
    }

    // Try to insert a test row to understand the expected schema
    console.log('\n2. Testing insert to understand schema...');
    
    // Try different possible schemas
    const testSchemas = [
      // Schema 1: with page_name column
      {
        name: 'Schema with page_name',
        data: {
          page_name: 'test',
          content: { title: 'Test' }
        }
      },
      // Schema 2: with page column
      {
        name: 'Schema with page',
        data: {
          page: 'test',
          content: { title: 'Test' }
        }
      },
      // Schema 3: with name column
      {
        name: 'Schema with name',
        data: {
          name: 'test',
          content: { title: 'Test' }
        }
      },
      // Schema 4: with id and content only
      {
        name: 'Schema with content only',
        data: {
          content: { title: 'Test', page: 'about' }
        }
      }
    ];

    for (const schema of testSchemas) {
      console.log(`\n   Testing ${schema.name}...`);
      const { data, error } = await supabase
        .from('page_content')
        .insert(schema.data)
        .select();
      
      if (error) {
        console.log(`   ❌ ${schema.name} failed:`, error.message);
      } else {
        console.log(`   ✅ ${schema.name} succeeded!`);
        console.log('   📋 Inserted data:', JSON.stringify(data[0], null, 2));
        
        // Clean up the test data
        await supabase
          .from('page_content')
          .delete()
          .eq('id', data[0].id);
        console.log('   🧹 Test data cleaned up');
        break;
      }
    }

    // Check if there are any existing about page entries
    console.log('\n3. Checking for existing about page entries...');
    
    // Try different ways to find about page content
    const searchMethods = [
      { method: 'page_name = about', filter: (query) => query.eq('page_name', 'about') },
      { method: 'page = about', filter: (query) => query.eq('page', 'about') },
      { method: 'name = about', filter: (query) => query.eq('name', 'about') },
      { method: 'content contains about', filter: (query) => query.contains('content', { page: 'about' }) }
    ];

    for (const method of searchMethods) {
      try {
        const query = supabase.from('page_content').select('*');
        const { data, error } = await method.filter(query);
        
        if (!error && data && data.length > 0) {
          console.log(`   ✅ Found about page using ${method.method}:`);
          console.log('   📋 Data:', JSON.stringify(data[0], null, 2));
          break;
        } else if (error) {
          console.log(`   ❌ ${method.method} failed:`, error.message);
        } else {
          console.log(`   ⚠️ ${method.method} returned no results`);
        }
      } catch (err) {
        console.log(`   ❌ ${method.method} threw error:`, err.message);
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the schema check
checkPageContentSchema().then(() => {
  console.log('\n🏁 Schema check completed!');
}).catch(error => {
  console.error('💥 Schema check failed:', error);
});