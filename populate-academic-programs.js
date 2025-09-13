import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function populateAcademicPrograms() {
  try {
    console.log('Populating academic_programs table with existing schema...');
    
    // First, clear any existing data
    console.log('Clearing existing data...');
    const { error: deleteError } = await supabase
      .from('academic_programs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.log('Delete error (table might be empty):', deleteError);
    }
    
    // Insert data using the current schema (program_name, program_description)
    const programs = [
      {
        program_name: 'Pre-School (KG 1 & KG 2)',
        program_description: 'Foundation learning through play-based activities and early childhood development programs. Our Pre-School program provides a nurturing environment for children aged 3-5 years.',
        duration: '2 Years',
        eligibility_criteria: 'Age 3-5 years',
        is_active: true,
        display_order: 1
      },
      {
        program_name: 'Primary School (Standards 1 - 4)',
        program_description: 'Building strong academic foundations with comprehensive curriculum and skill development. Our Primary School program focuses on building strong foundational skills in core subjects.',
        duration: '4 Years',
        eligibility_criteria: 'Completion of Pre-School or equivalent',
        is_active: true,
        display_order: 2
      },
      {
        program_name: 'UP School (Standards 5 - 7)',
        program_description: 'Intermediate education focusing on academic excellence and personality development. The Upper Primary School program bridges elementary and secondary education.',
        duration: '3 Years',
        eligibility_criteria: 'Completion of Primary School',
        is_active: true,
        display_order: 3
      },
      {
        program_name: 'Moral Studies',
        program_description: 'Character development and ethical education integrated across all levels. Our Moral Studies program focuses on character development, ethical values, and social responsibility.',
        duration: 'Ongoing',
        eligibility_criteria: 'All students',
        is_active: true,
        display_order: 4
      },
      {
        program_name: 'High School (Standards 8 - 10)',
        program_description: 'Comprehensive secondary education preparing students for higher studies and board examinations. Our High School program provides comprehensive secondary education aligned with state board curriculum.',
        duration: '3 Years',
        eligibility_criteria: 'Completion of UP School',
        is_active: true,
        display_order: 5
      },
      {
        program_name: 'Higher Secondary (Plus One & Plus Two)',
        program_description: 'Advanced education with stream specialization for college preparation and career readiness. Our Higher Secondary program offers specialized streams to prepare students for higher education.',
        duration: '2 Years',
        eligibility_criteria: 'Completion of High School',
        is_active: true,
        display_order: 6
      }
    ];
    
    console.log('Inserting academic programs...');
    const { data, error } = await supabase
      .from('academic_programs')
      .insert(programs)
      .select();
    
    if (error) {
      console.error('Error inserting data:', error);
    } else {
      console.log(`Successfully inserted ${data.length} academic programs:`);
      data.forEach((program, index) => {
        console.log(`${index + 1}. ${program.program_name} (ID: ${program.id})`);
      });
    }
    
    // Now let's test if we can read the data
    console.log('\nTesting data retrieval...');
    const { data: testData, error: testError } = await supabase
      .from('academic_programs')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (testError) {
      console.error('Error reading data:', testError);
    } else {
      console.log(`Successfully retrieved ${testData.length} active programs`);
    }
    
  } catch (err) {
    console.error('Script error:', err);
  }
}

populateAcademicPrograms();