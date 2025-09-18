-- VPS Database Schema Migration
-- Generated: 2025-09-18T04:56:07.260Z

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS academic_programs (category VARCHAR(50) NOT NULL, is_active BOOLEAN DEFAULT true, id UUID NOT NULL DEFAULT gen_random_uuid(), program_title VARCHAR(255) NOT NULL, short_description TEXT NOT NULL, full_description TEXT NOT NULL, main_image VARCHAR(500), updated_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now(), display_order INTEGER DEFAULT 0);

CREATE TABLE IF NOT EXISTS admission_forms (is_active BOOLEAN NOT NULL DEFAULT false, id UUID NOT NULL DEFAULT gen_random_uuid(), academic_year TEXT NOT NULL DEFAULT ''::text, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), form_type TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS admission_forms_legacy (email TEXT NOT NULL, parent_name TEXT NOT NULL, reviewed_by UUID, status TEXT DEFAULT 'pending'::text, student_name TEXT NOT NULL, previous_school TEXT, submitted_at TIMESTAMPTZ DEFAULT now(), notes TEXT, grade TEXT NOT NULL, address TEXT, reviewed_at TIMESTAMPTZ, id UUID NOT NULL DEFAULT gen_random_uuid(), phone TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS article_comments (comment_text TEXT NOT NULL, author_email TEXT NOT NULL, author_name TEXT NOT NULL, id UUID NOT NULL DEFAULT gen_random_uuid(), article_id UUID NOT NULL, is_approved BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS article_likes (id UUID NOT NULL DEFAULT gen_random_uuid(), user_ip TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), article_id UUID NOT NULL);

CREATE TABLE IF NOT EXISTS audit_logs (user_id UUID, action VARCHAR(20) NOT NULL, table_name VARCHAR(100) NOT NULL, record_id UUID, old_values JSONB, new_values JSONB, created_at TIMESTAMPTZ DEFAULT now(), id UUID NOT NULL DEFAULT gen_random_uuid());

CREATE TABLE IF NOT EXISTS breaking_news (content TEXT NOT NULL, is_active BOOLEAN DEFAULT true, id UUID NOT NULL DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT now(), priority INTEGER DEFAULT 0, updated_at TIMESTAMPTZ DEFAULT now(), expires_at TIMESTAMPTZ, title TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS contact_submissions (phone TEXT, full_name TEXT NOT NULL, email TEXT NOT NULL, id UUID NOT NULL DEFAULT gen_random_uuid(), status TEXT DEFAULT 'pending'::text, updated_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now(), subject TEXT NOT NULL, message TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS events (event_date TIMESTAMPTZ NOT NULL, image_url TEXT, location TEXT, description TEXT NOT NULL, title TEXT NOT NULL, id UUID NOT NULL DEFAULT gen_random_uuid(), is_featured BOOLEAN DEFAULT false, is_published BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS gallery_photos (updated_at TIMESTAMPTZ DEFAULT now(), is_active BOOLEAN NOT NULL DEFAULT true, title TEXT NOT NULL, description TEXT, image_url TEXT NOT NULL, category TEXT DEFAULT 'general'::text, id UUID NOT NULL DEFAULT gen_random_uuid(), is_featured BOOLEAN DEFAULT false, display_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS hero_slides (image_url TEXT, id UUID NOT NULL DEFAULT gen_random_uuid(), order_index INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), button_url TEXT, button_text TEXT, display_order INTEGER DEFAULT 0, title TEXT NOT NULL, subtitle TEXT);

CREATE TABLE IF NOT EXISTS interview_subject_templates (created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), template_name TEXT NOT NULL, subject_list ARRAY NOT NULL, id UUID NOT NULL DEFAULT gen_random_uuid(), is_active BOOLEAN DEFAULT true);

CREATE TABLE IF NOT EXISTS interview_subjects (created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), subject_name TEXT NOT NULL, id UUID NOT NULL DEFAULT gen_random_uuid(), application_id UUID NOT NULL, marks_obtained INTEGER, max_marks INTEGER DEFAULT 100);

CREATE TABLE IF NOT EXISTS kg_std_applications (guardian_name TEXT, id UUID NOT NULL DEFAULT gen_random_uuid(), date_of_birth DATE NOT NULL, interview_date DATE, interview_time TIME, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), application_number TEXT NOT NULL, fullname_name TEXT NOT NULL, gender TEXT NOT NULL, father_name TEXT NOT NULL, mother_name TEXT NOT NULL, house_name TEXT NOT NULL, village TEXT NOT NULL, post_office TEXT NOT NULL, district TEXT NOT NULL, pincode TEXT NOT NULL, mobile_number TEXT NOT NULL, email TEXT, previous_school TEXT, status TEXT DEFAULT 'pending'::text);

CREATE TABLE IF NOT EXISTS leadership_messages (person_name TEXT NOT NULL, position TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), id UUID NOT NULL DEFAULT gen_random_uuid(), is_active BOOLEAN DEFAULT true, message_content TEXT NOT NULL, display_order INTEGER DEFAULT 0, photo_url TEXT, person_title TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT now());

CREATE TABLE IF NOT EXISTS news_posts (id UUID NOT NULL DEFAULT gen_random_uuid(), featured_image TEXT, category TEXT, publication_date TIMESTAMPTZ DEFAULT now(), tags ARRAY, updated_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now(), published_at TIMESTAMPTZ, author TEXT, slug TEXT, is_published BOOLEAN DEFAULT false, author_id UUID, title TEXT NOT NULL, content TEXT, excerpt TEXT);

CREATE TABLE IF NOT EXISTS page_content (page_title TEXT NOT NULL, id UUID NOT NULL DEFAULT gen_random_uuid(), page_key TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), meta_description TEXT, content TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS plus_one_applications (father_name TEXT NOT NULL, house_name TEXT NOT NULL, village TEXT NOT NULL, post_office TEXT NOT NULL, district TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now(), pincode TEXT NOT NULL, landmark TEXT, mobile_number TEXT NOT NULL, email TEXT, tenth_school TEXT NOT NULL, board TEXT NOT NULL, interview_time TIME, interview_date DATE, has_siblings BOOLEAN, date_of_birth DATE NOT NULL, id UUID NOT NULL DEFAULT gen_random_uuid(), exam_year TEXT NOT NULL, exam_roll_number TEXT NOT NULL, stream TEXT NOT NULL, siblings_names TEXT, status TEXT DEFAULT 'pending'::text, full_name TEXT NOT NULL, application_number TEXT NOT NULL, gender TEXT NOT NULL, mother_name TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS school_features (created_at TIMESTAMPTZ DEFAULT now(), feature_description TEXT NOT NULL, is_active BOOLEAN DEFAULT true, display_order INTEGER DEFAULT 0, feature_title TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT now(), icon_name TEXT NOT NULL, id UUID NOT NULL DEFAULT gen_random_uuid());

CREATE TABLE IF NOT EXISTS school_stats (is_active BOOLEAN DEFAULT true, value INTEGER NOT NULL, id UUID NOT NULL DEFAULT gen_random_uuid(), icon_name TEXT, suffix TEXT, label TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now(), display_order INTEGER DEFAULT 0);

CREATE TABLE IF NOT EXISTS social_media_links (id UUID NOT NULL DEFAULT gen_random_uuid(), updated_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now(), display_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true, url TEXT NOT NULL, platform TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS staff_counts (created_at TIMESTAMPTZ DEFAULT now(), guides_staff INTEGER DEFAULT 0, security_staff INTEGER DEFAULT 0, professional_staff INTEGER DEFAULT 0, updated_at TIMESTAMPTZ DEFAULT now(), teaching_staff INTEGER DEFAULT 0, id UUID NOT NULL DEFAULT gen_random_uuid());

CREATE TABLE IF NOT EXISTS testimonials (person_name TEXT NOT NULL, is_active BOOLEAN DEFAULT true, rating INTEGER, relation TEXT NOT NULL, id UUID NOT NULL DEFAULT gen_random_uuid(), quote TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), status TEXT DEFAULT 'pending'::text, photo TEXT, updated_at TIMESTAMPTZ DEFAULT now(), display_order INTEGER DEFAULT 0);

CREATE TABLE IF NOT EXISTS user_roles (updated_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now(), role TEXT NOT NULL, id UUID NOT NULL DEFAULT gen_random_uuid(), user_id UUID NOT NULL);

