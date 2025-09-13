import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function createAcademicPrograms() {
  try {
    console.log('Creating academic_programs table...');
    
    // First, let's check if the table exists
    const { data: existingData, error: checkError } = await supabase
      .from('academic_programs')
      .select('*')
      .limit(1);
    
    if (!checkError) {
      console.log('Table already exists. Checking data...');
      const { data: allData, error: countError } = await supabase
        .from('academic_programs')
        .select('*');
      
      if (!countError) {
        console.log(`Found ${allData.length} records in academic_programs table`);
        if (allData.length > 0) {
          console.log('Sample record:', allData[0]);
          return;
        }
      }
    }
    
    console.log('Inserting initial academic programs data...');
    
    const programs = [
      {
        program_title: 'Pre-School (KG 1 & KG 2)',
        short_description: 'Foundation learning through play-based activities and early childhood development programs.',
        full_description: 'Our Pre-School program provides a nurturing environment for children aged 3-5 years. We focus on developing social skills, basic literacy, numeracy, and creativity through structured play activities.',
        subjects: ['Basic Literacy', 'Numeracy', 'Art & Craft', 'Music & Movement', 'Social Skills', 'Environmental Awareness'],
        duration: '2 Years',
        is_active: true,
        display_order: 1
      },
      {
        program_title: 'Primary School (Standards 1 - 4)',
        short_description: 'Building strong academic foundations with comprehensive curriculum and skill development.',
        full_description: 'Our Primary School program focuses on building strong foundational skills in core subjects while fostering creativity and critical thinking.',
        subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Art Education', 'Physical Education', 'Computer Science'],
        duration: '4 Years',
        is_active: true,
        display_order: 2
      },
      {
        program_title: 'UP School (Standards 5 - 7)',
        short_description: 'Intermediate education focusing on academic excellence and personality development.',
        full_description: 'The Upper Primary School program bridges elementary and secondary education, providing students with advanced learning opportunities.',
        subjects: ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Computer Science', 'Art Education', 'Physical Education', 'Environmental Studies'],
        duration: '3 Years',
        is_active: true,
        display_order: 3
      },
      {
        program_title: 'Moral Studies',
        short_description: 'Character development and ethical education integrated across all levels.',
        full_description: 'Our Moral Studies program is integrated throughout all academic levels, focusing on character development, ethical values, and social responsibility.',
        subjects: ['Ethics & Values', 'Social Responsibility', 'Character Building', 'Community Service', 'Cultural Awareness', 'Leadership Skills'],
        duration: 'Ongoing',
        is_active: true,
        display_order: 4
      },
      {
        program_title: 'High School (Standards 8 - 10)',
        short_description: 'Comprehensive secondary education preparing students for higher studies and board examinations.',
        full_description: 'Our High School program provides comprehensive secondary education aligned with state board curriculum.',
        subjects: ['English', 'Mathematics', 'Science (Physics, Chemistry, Biology)', 'Social Studies', 'Hindi', 'Computer Science', 'Physical Education', 'Art Education'],
        duration: '3 Years',
        is_active: true,
        display_order: 5
      },
      {
        program_title: 'Higher Secondary (Plus One & Plus Two)',
        short_description: 'Advanced education with stream specialization for college preparation and career readiness.',
        full_description: 'Our Higher Secondary program offers specialized streams to prepare students for higher education and professional careers.',
        subjects: ['Science Stream (Physics, Chemistry, Mathematics/Biology)', 'Commerce Stream (Accountancy, Business Studies, Economics)', 'Arts Stream (History, Political Science, Economics, Psychology)'],
        duration: '2 Years',
        is_active: true,
        display_order: 6
      }
    ];
    
    const { data, error } = await supabase
      .from('academic_programs')
      .insert(programs)
      .select();
    
    if (error) {
      console.error('Error inserting data:', error);
    } else {
      console.log(`Successfully inserted ${data.length} academic programs`);
      data.forEach((program, index) => {
        console.log(`${index + 1}. ${program.program_title} (ID: ${program.id})`);
      });
    }
    
  } catch (err) {
    console.error('Script error:', err);
  }
}

createAcademicPrograms();