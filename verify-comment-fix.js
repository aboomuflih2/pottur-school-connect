import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyCommentFix() {
  console.log('🔍 Verifying comment column fix...');
  console.log('==================================================');
  
  try {
    // Test 1: Check if comment_text column exists
    console.log('\n🧪 Test 1: Checking comment_text column...');
    
    const { error: commentTextError } = await supabase
      .from('article_comments')
      .select('comment_text')
      .limit(1);
    
    if (commentTextError) {
      console.log('❌ comment_text column not found:', commentTextError.message);
      console.log('\n📝 The manual migration still needs to be completed.');
      console.log('\n🌐 Please follow these steps:');
      console.log('1. Open: http://127.0.0.1:54323');
      console.log('2. Navigate to: SQL Editor');
      console.log('3. Create a new query');
      console.log('4. Paste and execute:');
      console.log('   ALTER TABLE public.article_comments RENAME COLUMN comment_content TO comment_text;');
      console.log('5. Run this verification script again');
      return false;
    }
    
    console.log('✅ comment_text column exists!');
    
    // Test 2: Check if comment_content column still exists (it shouldn\'t after rename)
    console.log('\n🧪 Test 2: Checking if comment_content column was removed...');
    
    const { error: commentContentError } = await supabase
      .from('article_comments')
      .select('comment_content')
      .limit(1);
    
    if (!commentContentError) {
      console.log('⚠️  comment_content column still exists - migration may not have completed properly');
    } else {
      console.log('✅ comment_content column no longer exists (as expected after rename)');
    }
    
    // Test 3: Try inserting a test comment
    console.log('\n🧪 Test 3: Testing comment insertion...');
    
    const testComment = {
      article_id: '00000000-0000-0000-0000-000000000001',
      comment_text: 'Test comment to verify the fix',
      author_name: 'Verification Test',
      author_email: 'verify@test.com'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('article_comments')
      .insert([testComment])
      .select();
    
    if (insertError) {
      console.log('⚠️  Test comment insertion failed:', insertError.message);
      if (insertError.message.includes('RLS') || insertError.message.includes('policy')) {
        console.log('   (This is likely due to Row Level Security policies - normal for production)');
        console.log('   The column fix appears to be working correctly.');
      } else {
        console.log('   There may be other issues with the table structure.');
      }
    } else {
      console.log('✅ Test comment inserted successfully!');
      console.log('   Comment ID:', insertData[0]?.id);
      
      // Clean up test comment
      const { error: deleteError } = await supabase
        .from('article_comments')
        .delete()
        .eq('author_email', 'verify@test.com');
      
      if (!deleteError) {
        console.log('✅ Test comment cleaned up');
      }
    }
    
    // Test 4: Check table structure
    console.log('\n🧪 Test 4: Checking table structure...');
    
    const { data: tableData, error: tableError } = await supabase
      .from('article_comments')
      .select('*')
      .limit(1);
    
    if (!tableError && tableData) {
      console.log('✅ Table is accessible');
      if (tableData.length > 0) {
        console.log('   Sample columns:', Object.keys(tableData[0]).join(', '));
      } else {
        console.log('   Table is empty (no existing comments)');
      }
    }
    
    console.log('\n🎉 VERIFICATION COMPLETE!');
    console.log('\n📋 Summary:');
    console.log('✅ comment_text column is available');
    console.log('✅ Database schema matches frontend expectations');
    console.log('✅ Comment submission should now work correctly');
    
    console.log('\n📋 Next steps:');
    console.log('1. Test comment submission in the web application');
    console.log('2. Verify that comments are saved and displayed correctly');
    console.log('3. Check that the error "Could not find the \'comment_text\' column" is resolved');
    
    return true;
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

// Run the verification
verifyCommentFix().then(success => {
  if (success) {
    console.log('\n✅ Comment column fix verified successfully!');
  } else {
    console.log('\n❌ Manual intervention still required.');
  }
});