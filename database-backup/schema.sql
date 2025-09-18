-- Database Schema Export
-- Generated: 2025-09-18T04:51:03.156Z

-- Table: academic_programs
CREATE TABLE IF NOT EXISTS public.academic_programs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_title character varying(255) NOT NULL,
  short_description text NOT NULL,
  full_description text NOT NULL,
  main_image character varying(500),
  category character varying(50) NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: admission_forms
CREATE TABLE IF NOT EXISTS public.admission_forms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  form_type text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  academic_year text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table: admission_forms_legacy
CREATE TABLE IF NOT EXISTS public.admission_forms_legacy (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  parent_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  grade text NOT NULL,
  previous_school text,
  status text DEFAULT 'pending'::text,
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  notes text
);

-- Table: article_comments
CREATE TABLE IF NOT EXISTS public.article_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  author_name text NOT NULL,
  author_email text NOT NULL,
  comment_text text NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: article_likes
CREATE TABLE IF NOT EXISTS public.article_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  user_ip text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  table_name character varying(100) NOT NULL,
  action character varying(20) NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: breaking_news
CREATE TABLE IF NOT EXISTS public.breaking_news (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: contact_submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: events
CREATE TABLE IF NOT EXISTS public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event_date timestamp with time zone NOT NULL,
  location text,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT true,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: gallery_photos
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  category text DEFAULT 'general'::text,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

-- Table: hero_slides
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text,
  button_text text,
  button_url text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  display_order integer DEFAULT 0
);

-- Table: interview_subject_templates
CREATE TABLE IF NOT EXISTS public.interview_subject_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  subject_list ARRAY NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: interview_subjects
CREATE TABLE IF NOT EXISTS public.interview_subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  subject_name text NOT NULL,
  marks_obtained integer,
  max_marks integer DEFAULT 100,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: kg_std_applications
CREATE TABLE IF NOT EXISTS public.kg_std_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_number text NOT NULL,
  fullname_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL,
  father_name text NOT NULL,
  mother_name text NOT NULL,
  guardian_name text,
  house_name text NOT NULL,
  village text NOT NULL,
  post_office text NOT NULL,
  district text NOT NULL,
  pincode text NOT NULL,
  mobile_number text NOT NULL,
  email text,
  previous_school text,
  status text DEFAULT 'pending'::text,
  interview_date date,
  interview_time time without time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: leadership_messages
CREATE TABLE IF NOT EXISTS public.leadership_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  person_name text NOT NULL,
  person_title text NOT NULL,
  position text NOT NULL,
  message_content text NOT NULL,
  photo_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: news_posts
CREATE TABLE IF NOT EXISTS public.news_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  excerpt text,
  featured_image text,
  author_id uuid,
  category text,
  tags ARRAY,
  is_published boolean DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  publication_date timestamp with time zone DEFAULT now(),
  author text,
  slug text
);

-- Table: page_content
CREATE TABLE IF NOT EXISTS public.page_content (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  page_title text NOT NULL,
  content text NOT NULL,
  meta_description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: plus_one_applications
CREATE TABLE IF NOT EXISTS public.plus_one_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_number text NOT NULL,
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL,
  father_name text NOT NULL,
  mother_name text NOT NULL,
  house_name text NOT NULL,
  village text NOT NULL,
  post_office text NOT NULL,
  district text NOT NULL,
  pincode text NOT NULL,
  landmark text,
  mobile_number text NOT NULL,
  email text,
  tenth_school text NOT NULL,
  board text NOT NULL,
  exam_year text NOT NULL,
  exam_roll_number text NOT NULL,
  stream text NOT NULL,
  has_siblings boolean,
  siblings_names text,
  status text DEFAULT 'pending'::text,
  interview_date date,
  interview_time time without time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: school_features
CREATE TABLE IF NOT EXISTS public.school_features (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  feature_title text NOT NULL,
  feature_description text NOT NULL,
  icon_name text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: school_stats
CREATE TABLE IF NOT EXISTS public.school_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value integer NOT NULL,
  suffix text,
  icon_name text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: social_media_links
CREATE TABLE IF NOT EXISTS public.social_media_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: staff_counts
CREATE TABLE IF NOT EXISTS public.staff_counts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teaching_staff integer DEFAULT 0,
  professional_staff integer DEFAULT 0,
  security_staff integer DEFAULT 0,
  guides_staff integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  person_name text NOT NULL,
  relation text NOT NULL,
  quote text NOT NULL,
  rating integer,
  photo text,
  is_active boolean DEFAULT true,
  status text DEFAULT 'pending'::text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

