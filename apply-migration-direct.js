import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('Applying academic programs migration...');
  
  try {
    // Step 1: Check if table exists and has correct schema
    console.log('1. Checking current table schema...');
    const { data: existingData, error: checkError } = await supabase
      .from('academic_programs')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.log('Table may not exist or has wrong schema:', checkError.message);
    }
    
    // Step 2: Insert the 6 academic programs with new schema
    console.log('2. Inserting academic programs data...');
    const academicPrograms = [
      {
        program_title: 'Science Stream',
        short_description: 'Comprehensive science education with Physics, Chemistry, Biology, and Mathematics',
        full_description: 'Our Science Stream offers a rigorous curriculum designed to prepare students for careers in medicine, engineering, and scientific research. Students engage with advanced laboratory work, research projects, and theoretical studies across all major scientific disciplines.',
        main_image: null
      },
      {
        program_title: 'Commerce Stream',
        short_description: 'Business and commerce education with Accounting, Economics, and Business Studies',
        full_description: 'The Commerce Stream provides students with essential business knowledge and skills. Our curriculum covers accounting principles, economic theory, business management, and entrepreneurship, preparing students for careers in business, finance, and commerce.',
        main_image: null
      },
      {
        program_title: 'Arts Stream',
        short_description: 'Liberal arts education with Literature, History, Political Science, and Languages',
        full_description: 'Our Arts Stream offers a well-rounded education in humanities and social sciences. Students explore literature, history, political science, and multiple languages, developing critical thinking and communication skills essential for various career paths.',
        main_image: null
      },
      {
        program_title: 'Computer Science',
        short_description: 'Modern computer science education with programming, algorithms, and technology',
        full_description: 'The Computer Science program combines theoretical knowledge with practical programming skills. Students learn various programming languages, software development, database management, and emerging technologies like AI and machine learning.',
        main_image: null
      },
      {
        program_title: 'Vocational Training',
        short_description: 'Practical skills training for immediate employment opportunities',
        full_description: 'Our Vocational Training programs provide hands-on skills in various trades and technical fields. Students gain practical experience and industry-relevant certifications that prepare them for immediate employment in their chosen field.',
        main_image: null
      },
      {
        program_title: 'Language Studies',
        short_description: 'Comprehensive language education in English, Hindi, and regional languages',
        full_description: 'The Language Studies program focuses on developing strong communication skills in multiple languages. Students study literature, linguistics, and cultural aspects of languages, preparing them for careers in education, translation, and international relations.',
        main_image: null
      }
    ];
    
    const { data, error } = await supabase
      .from('academic_programs')
      .insert(academicPrograms)
      .select();
    
    if (error) {
      console.error('Insert error:', error);
      console.log('\n=== MANUAL MIGRATION REQUIRED ===');
      console.log('The table schema is incorrect. Please run the migration SQL manually:');
      console.log('1. Open Supabase Dashboard at http://127.0.0.1:54321');
      console.log('2. Go to SQL Editor');
      console.log('3. Run the migration file: supabase/migrations/016_fix_academic_programs_schema.sql');
      return;
    }
    
    console.log(`✅ Successfully inserted ${data.length} academic programs`);
    
    // Step 3: Verify the migration
    console.log('3. Verifying migration...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('academic_programs')
      .select('*');
    
    if (verifyError) {
      console.error('Verification error:', verifyError);
      return;
    }
    
    console.log(`✅ Migration completed successfully! Found ${verifyData.length} programs`);
    console.log('Programs:', verifyData.map(p => p.program_title));
    
    // Step 4: Test admin interface access
    console.log('\n4. Next steps:');
    console.log('- Access admin interface at: http://localhost:5173/admin/academics');
    console.log('- Test image upload functionality');
    console.log('- Verify content management works correctly');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

applyMigration();