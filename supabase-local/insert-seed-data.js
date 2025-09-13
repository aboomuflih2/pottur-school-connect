import { createClient } from '@supabase/supabase-js';

// Local Supabase connection
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertSeedData() {
  try {
    console.log('Starting seed data insertion...');

    // Insert admission forms
    const { data: admissionData, error: admissionError } = await supabase
      .from('admission_forms')
      .insert([
        {
          student_name: 'Arjun Kumar',
          father_name: 'Rajesh Kumar',
          mother_name: 'Priya Kumar',
          date_of_birth: '2010-05-15',
          gender: 'male',
          address: '123 Main Street, Pottur',
          phone: '9876543210',
          email: 'rajesh.kumar@email.com',
          previous_school: 'ABC Primary School',
          class_applying_for: 'Class 6',
          status: 'pending'
        },
        {
          student_name: 'Meera Nair',
          father_name: 'Suresh Nair',
          mother_name: 'Lakshmi Nair',
          date_of_birth: '2009-08-22',
          gender: 'female',
          address: '456 School Road, Pottur',
          phone: '9876543211',
          email: 'suresh.nair@email.com',
          previous_school: 'XYZ Elementary',
          class_applying_for: 'Class 7',
          status: 'approved'
        }
      ]);

    if (admissionError) {
      console.error('Error inserting admission forms:', admissionError);
    } else {
      console.log('Admission forms inserted successfully:', admissionData);
    }

    // Insert news posts
    const { data: newsData, error: newsError } = await supabase
      .from('news_posts')
      .insert([
        {
          title: 'Annual Sports Day 2024',
          content: 'Join us for our annual sports day celebration with various competitions and activities for all students.',
          author: 'Principal',
          published_at: '2024-01-15T10:00:00Z',
          is_published: true,
          category: 'events'
        },
        {
          title: 'New Science Laboratory Inauguration',
          content: 'We are excited to announce the inauguration of our new state-of-the-art science laboratory.',
          author: 'Admin',
          published_at: '2024-01-10T09:00:00Z',
          is_published: true,
          category: 'announcements'
        }
      ]);

    if (newsError) {
      console.error('Error inserting news posts:', newsError);
    } else {
      console.log('News posts inserted successfully:', newsData);
    }

    // Insert hero slides
    const { data: heroData, error: heroError } = await supabase
      .from('hero_slides')
      .insert([
        {
          title: 'Welcome to Pottur School',
          subtitle: 'Excellence in Education Since 1950',
          image_url: '/images/hero-slide-1.jpg',
          cta_text: 'Learn More',
          cta_url: '/about',
          is_active: true,
          sort_order: 1
        },
        {
          title: 'Admissions Open',
          subtitle: 'Join Our Learning Community',
          image_url: '/images/hero-slide-2.jpg',
          cta_text: 'Apply Now',
          cta_url: '/admissions',
          is_active: true,
          sort_order: 2
        }
      ]);

    if (heroError) {
      console.error('Error inserting hero slides:', heroError);
    } else {
      console.log('Hero slides inserted successfully:', heroData);
    }

    console.log('Seed data insertion completed!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

insertSeedData();