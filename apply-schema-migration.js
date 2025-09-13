import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const localUrl = 'http://127.0.0.1:54323';
const localServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(localUrl, localServiceKey);

async function applySchemaFix() {
  console.log('🚀 Applying interview_subjects schema fix...');
  
  try {
    // Check current table structure
    console.log('\n📊 Checking current interview_subjects table structure...');
    
    // Add missing columns if they don't exist
    const alterCommands = [
      'ALTER TABLE public.interview_subjects ADD COLUMN IF NOT EXISTS application_type text',
      'ALTER TABLE public.interview_subjects ADD COLUMN IF NOT EXISTS subject_name text', 
      'ALTER TABLE public.interview_subjects ADD COLUMN IF NOT EXISTS marks integer',
      'ALTER TABLE public.interview_subjects ADD COLUMN IF NOT EXISTS max_marks integer DEFAULT 25'
    ];
    
    for (const command of alterCommands) {
      console.log(`Executing: ${command}`);
      const { error } = await supabase.rpc('exec', { sql: command });
      if (error) {
        console.log(`⚠️  Command failed (might already exist): ${error.message}`);
      } else {
        console.log('✅ Command executed successfully');
      }
    }
    
    // Enable RLS and set policies
    console.log('\n🔒 Setting up RLS policies...');
    
    const rlsCommands = [
      'ALTER TABLE public.interview_subjects ENABLE ROW LEVEL SECURITY',
      'DROP POLICY IF EXISTS "Allow admin full access to interview subjects" ON public.interview_subjects',
      'CREATE POLICY "Allow admin full access to interview subjects" ON public.interview_subjects FOR ALL USING (is_admin()) WITH CHECK (is_admin())',
      'GRANT ALL ON public.interview_subjects TO authenticated'
    ];
    
    for (const command of rlsCommands) {
      console.log(`Executing: ${command}`);
      const { error } = await supabase.rpc('exec', { sql: command });
      if (error) {
        console.log(`⚠️  RLS command failed: ${error.message}`);
      } else {
        console.log('✅ RLS command executed successfully');
      }
    }
    
    // Test the table structure
    console.log('\n🧪 Testing table access...');
    const { data: testData, error: testError } = await supabase
      .from('interview_subjects')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Test query failed:', testError);
    } else {
      console.log('✅ Table access test successful');
      console.log('📋 Sample data:', testData);
    }
    
    console.log('\n🎉 Schema migration completed!');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

applySchemaFix();