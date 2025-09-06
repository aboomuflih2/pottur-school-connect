-- Update academic_programs table to support the new academic journey structure
ALTER TABLE public.academic_programs 
ADD COLUMN IF NOT EXISTS main_image text,
ADD COLUMN IF NOT EXISTS full_description text;

-- Clear existing data and insert the 6 academic levels
DELETE FROM public.academic_programs;

INSERT INTO public.academic_programs (
  program_title, 
  short_description, 
  full_description,
  subjects,
  duration,
  display_order,
  is_active
) VALUES 
(
  'Pre-School (KG 1 & KG 2)',
  'Play-based learning approach focusing on foundational skills and creative development.',
  'Our Pre-School program creates a nurturing environment where young minds flourish through play-based learning. We focus on developing foundational skills in literacy, numeracy, and social interaction while fostering creativity and curiosity. Our experienced teachers guide children through age-appropriate activities that build confidence and prepare them for their academic journey ahead.',
  ARRAY['Creative Arts', 'Basic Literacy', 'Number Concepts', 'Social Skills', 'Physical Development'],
  '2 Years',
  1,
  true
),
(
  'Primary School (Standards 1 - 4)',
  'Building strong academic foundations with core subjects and holistic development.',
  'The Primary School years are crucial for establishing strong academic foundations. Our comprehensive curriculum covers core subjects including English, Mathematics, Science, and Social Studies, while emphasizing reading comprehension, critical thinking, and problem-solving skills. We ensure each child develops confidence in learning and builds the essential skills needed for advanced education.',
  ARRAY['English Language', 'Mathematics', 'Science', 'Social Studies', 'Art & Craft', 'Physical Education'],
  '4 Years',
  2,
  true
),
(
  'Upper Primary School (Standards 5 - 7)',
  'Advanced subjects with project-based learning and extracurricular development.',
  'Upper Primary education marks the transition to more sophisticated learning approaches. Students engage in project-based work, develop research skills, and explore subjects in greater depth. Our program emphasizes analytical thinking, collaborative learning, and the development of individual talents through various extracurricular activities and academic competitions.',
  ARRAY['Advanced Mathematics', 'Science & Technology', 'Language Arts', 'History & Geography', 'Computer Studies', 'Creative Writing'],
  '3 Years',
  3,
  true
),
(
  'Moral Studies (A Core Value)',
  'Integrating ethical education and character development across all standards.',
  'Moral Studies forms the backbone of our educational philosophy, integrated across all academic levels. We believe in developing not just academically excellent students, but individuals with strong moral character, empathy, and social responsibility. Through stories, discussions, and real-life applications, students learn values that will guide them throughout their lives.',
  ARRAY['Ethics & Values', 'Character Development', 'Social Responsibility', 'Cultural Awareness', 'Leadership Skills'],
  'Ongoing',
  4,
  true
),
(
  'High School (Standards 8 - 10)',
  'Comprehensive curriculum preparing students for board exams and future academic choices.',
  'High School education at our institution is designed to prepare students for board examinations while developing critical thinking and analytical skills. Our comprehensive curriculum covers all major subjects with specialized attention to each student''s strengths and interests. We provide additional support through remedial classes, competitive exam preparation, and career counseling.',
  ARRAY['Advanced Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature', 'History', 'Geography', 'Computer Science'],
  '3 Years',
  5,
  true
),
(
  'Higher Secondary (+1 & +2)',
  'Specialized streams in Science and Commerce with career guidance and coaching.',
  'Our Higher Secondary program offers specialized streams in Science and Commerce, designed to prepare students for competitive entrance exams and future career paths. With experienced faculty, modern laboratories, and comprehensive study materials, we ensure students are well-equipped for higher education. Our career guidance program helps students make informed decisions about their academic and professional future.',
  ARRAY['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Accountancy', 'Business Studies', 'Economics', 'Computer Applications'],
  '2 Years',
  6,
  true
);