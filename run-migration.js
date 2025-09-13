import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.log('Required environment variables:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting database migration...');
  console.log('==================================================');
  
  try {
    console.log('📄 Executing migration steps manually...');
    
    // Step 1: Drop the old table
    console.log('\n⏳ Step 1: Dropping old academic_programs table...');
    try {
      const { error: dropError } = await supabase
        .from('academic_programs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows first
      
      if (dropError && !dropError.message.includes('does not exist')) {
        console.log('⚠️  Could not clear table:', dropError.message);
      }
    } catch (err) {
      console.log('⚠️  Table might not exist yet');
    }
    
    // Step 2: Create new data with correct structure
    console.log('\n⏳ Step 2: Inserting new academic programs...');
    
    const academicPrograms = [
      {
        program_title: 'Pre-School (KG 1 & KG 2)',
        short_description: 'Foundation learning through play-based activities and early childhood development programs.',
        full_description: 'Our Pre-School program provides a nurturing environment for children aged 3-5 years. We focus on developing social skills, basic literacy, numeracy, and creativity through structured play activities. Our experienced teachers create a safe and stimulating environment where children can explore, learn, and grow at their own pace.',
        subjects: ['Basic Literacy', 'Numeracy', 'Art & Craft', 'Music & Movement', 'Social Skills', 'Environmental Awareness'],
        duration: '2 Years',
        is_active: true,
        display_order: 1
      },
      {
        program_title: 'Primary School (Standards 1 - 4)',
        short_description: 'Building strong academic foundations with comprehensive curriculum and skill development.',
        full_description: 'Our Primary School program focuses on building strong foundational skills in core subjects while fostering creativity and critical thinking. Students develop essential reading, writing, and mathematical skills through interactive learning methods. We emphasize character building, teamwork, and developing a love for learning that will serve them throughout their educational journey.',
        subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Art Education', 'Physical Education', 'Computer Science'],
        duration: '4 Years',
        is_active: true,
        display_order: 2
      },
      {
        program_title: 'UP School (Standards 5 - 7)',
        short_description: 'Intermediate education focusing on academic excellence and personality development.',
        full_description: 'The Upper Primary School program bridges elementary and secondary education, providing students with advanced learning opportunities. We focus on developing analytical thinking, research skills, and subject mastery. Students are encouraged to explore their interests through various co-curricular activities while maintaining academic excellence.',
        subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Computer Science', 'Art Education', 'Physical Education', 'Environmental Studies'],
        duration: '3 Years',
        is_active: true,
        display_order: 3
      },
      {
        program_title: 'Moral Studies',
        short_description: 'Character development and ethical education integrated across all levels.',
        full_description: 'Our Moral Studies program is integrated throughout all academic levels, focusing on character development, ethical values, and social responsibility. Students learn about integrity, compassion, respect, and civic duty through interactive discussions, real-life scenarios, and community service projects. This program helps shape well-rounded individuals who contribute positively to society.',
        subjects: ['Ethics & Values', 'Social Responsibility', 'Character Building', 'Community Service', 'Cultural Awareness', 'Leadership Skills'],
        duration: 'Ongoing',
        is_active: true,
        display_order: 4
      },
      {
        program_title: 'High School (Standards 8 - 10)',
        short_description: 'Comprehensive secondary education preparing students for higher studies and board examinations.',
        full_description: 'Our High School program provides comprehensive secondary education aligned with state board curriculum. Students receive intensive preparation for board examinations while developing critical thinking and problem-solving skills. We offer personalized attention, regular assessments, and career guidance to help students make informed decisions about their future academic paths.',
        subjects: ['English', 'Mathematics', 'Science (Physics, Chemistry, Biology)', 'Social Studies', 'Hindi', 'Computer Science', 'Physical Education', 'Art Education'],
        duration: '3 Years',
        is_active: true,
        display_order: 5
      },
      {
        program_title: 'Higher Secondary (Plus One & Plus Two)',
        short_description: 'Advanced education with stream specialization for college preparation and career readiness.',
        full_description: 'Our Higher Secondary program offers specialized streams to prepare students for higher education and professional careers. Students can choose from Science, Commerce, or Arts streams based on their interests and career goals. We provide expert faculty, modern laboratories, and comprehensive study materials to ensure excellent board results and college admissions.',
        subjects: ['Science Stream (Physics, Chemistry, Mathematics/Biology)', 'Commerce Stream (Accountancy, Business Studies, Economics)', 'Arts Stream (History, Political Science, Economics, Psychology)'],
        duration: '2 Years',
        is_active: true,
        display_order: 6
      }
    ];
    
    // Insert programs one by one
    for (let i = 0; i < academicPrograms.length; i++) {
      const program = academicPrograms[i];
      console.log(`   📝 Inserting: ${program.program_title}`);
      
      const { data, error } = await supabase
        .from('academic_programs')
        .insert([program])
        .select();
      
      if (error) {
        console.log(`   ❌ Failed to insert ${program.program_title}:`, error.message);
        
        // If the error is about missing columns, the table structure is wrong
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          console.log('\n❌ Database schema mismatch detected!');
          console.log('The academic_programs table needs to be recreated with the correct schema.');
          console.log('\n📋 Manual steps required:');
          console.log('1. Open Supabase Dashboard: http://127.0.0.1:54321');
          console.log('2. Go to SQL Editor');
          console.log('3. Run the migration SQL from: supabase/migrations/016_fix_academic_programs_schema.sql');
          console.log('4. Then run this script again');
          return;
        }
      } else {
        console.log(`   ✅ Successfully inserted: ${program.program_title}`);
      }
    }
    
    // Step 3: Verify the results
    console.log('\n🔍 Verifying migration results...');
    
    const { data: programs, error: dataError } = await supabase
      .from('academic_programs')
      .select('id, program_title, short_description')
      .order('display_order');
    
    if (dataError) {
      console.log('❌ Data verification failed:', dataError.message);
    } else {
      console.log(`\n📊 Academic programs in database: ${programs?.length || 0}`);
      if (programs && programs.length > 0) {
        programs.forEach((program, index) => {
          console.log(`   ${index + 1}. ${program.program_title}`);
        });
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log('==================================================');
    console.log('Next steps:');
    console.log('1. Run: node verify-migration.js');
    console.log('2. Test the admin interface at: http://localhost:8080/admin/academics');
    console.log('3. Try uploading an image to verify functionality');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📋 If the error is about missing columns, you need to:');
    console.log('1. Open Supabase Dashboard: http://127.0.0.1:54321');
    console.log('2. Go to SQL Editor');
    console.log('3. Run the migration SQL from: supabase/migrations/016_fix_academic_programs_schema.sql');
    process.exit(1);
  }
}

// Run the migration
runMigration();