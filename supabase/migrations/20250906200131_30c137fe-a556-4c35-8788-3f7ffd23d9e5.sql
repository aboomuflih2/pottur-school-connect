-- Create content management tables for admin dashboard

-- Hero slides/banners table
CREATE TABLE public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_title text NOT NULL,
  slide_subtitle text NOT NULL,
  background_image text,
  button_text text NOT NULL,
  button_link text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Breaking news table  
CREATE TABLE public.breaking_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Page content table for static pages
CREATE TABLE public.page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text UNIQUE NOT NULL, -- 'about', 'admissions', etc.
  page_title text NOT NULL,
  content text NOT NULL,
  meta_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Academic programs table
CREATE TABLE public.academic_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_title text NOT NULL,
  short_description text NOT NULL,
  detailed_description text NOT NULL,
  icon_image text,
  subjects text[], 
  duration text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- News posts table
CREATE TABLE public.news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text NOT NULL,
  featured_image text,
  publication_date timestamptz NOT NULL DEFAULT now(),
  author text NOT NULL,
  slug text UNIQUE NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Testimonials table
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name text NOT NULL,
  relation text NOT NULL, -- 'Parent', 'Alumni', 'Student', etc.
  quote text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  photo text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Contact form submissions table
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('hero-images', 'hero-images', true),
  ('news-images', 'news-images', true),
  ('program-icons', 'program-icons', true),
  ('testimonial-photos', 'testimonial-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breaking_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Public read policies (for website visitors)
CREATE POLICY "Anyone can read active hero slides"
  ON public.hero_slides FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Anyone can read active breaking news"
  ON public.breaking_news FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Anyone can read page content"
  ON public.page_content FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can read active academic programs"
  ON public.academic_programs FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Anyone can read published news"
  ON public.news_posts FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Anyone can read active testimonials"
  ON public.testimonials FOR SELECT 
  USING (is_active = true);

-- Admin-only policies for all operations
CREATE POLICY "Admins can manage hero slides"
  ON public.hero_slides FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage breaking news"
  ON public.breaking_news FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage page content"
  ON public.page_content FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage academic programs"
  ON public.academic_programs FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage news posts"
  ON public.news_posts FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view contact submissions"
  ON public.contact_submissions FOR SELECT 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact submissions"
  ON public.contact_submissions FOR UPDATE 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage policies
CREATE POLICY "Public can view uploaded images"
  ON storage.objects FOR SELECT 
  USING (bucket_id IN ('hero-images', 'news-images', 'program-icons', 'testimonial-photos'));

CREATE POLICY "Admins can upload images"
  ON storage.objects FOR INSERT 
  TO authenticated
  WITH CHECK (
    bucket_id IN ('hero-images', 'news-images', 'program-icons', 'testimonial-photos') 
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update images"
  ON storage.objects FOR UPDATE 
  TO authenticated
  USING (
    bucket_id IN ('hero-images', 'news-images', 'program-icons', 'testimonial-photos') 
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete images"
  ON storage.objects FOR DELETE 
  TO authenticated
  USING (
    bucket_id IN ('hero-images', 'news-images', 'program-icons', 'testimonial-photos') 
    AND public.has_role(auth.uid(), 'admin')
  );

-- Create updated_at triggers for all tables
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.breaking_news FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.page_content FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.academic_programs FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.news_posts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insert some seed data
INSERT INTO public.page_content (page_key, page_title, content, meta_description) VALUES
  ('about', 'About Modern Higher Secondary School', 'Welcome to Modern Higher Secondary School, Pottur - a leading educational institution committed to excellence in education and holistic development of students.', 'Learn about Modern Higher Secondary School Pottur - our mission, vision, and commitment to educational excellence.'),
  ('admissions', 'Admissions Information', 'Admission procedures and requirements for Modern Higher Secondary School, Pottur. We welcome students who are eager to learn and grow in a supportive environment.', 'Admission information, procedures, and requirements for Modern Higher Secondary School Pottur.');

INSERT INTO public.breaking_news (message) VALUES
  ('Admissions Open for Academic Year 2024-25! Apply now for classes XI & XII. Last date: March 31, 2024');

-- Seed some hero slides from existing data
INSERT INTO public.hero_slides (slide_title, slide_subtitle, button_text, button_link, display_order) VALUES
  ('Excellence in Education', 'Shaping Future Leaders at Modern Higher Secondary School, Pottur', 'Explore Academics', '/academics', 1),
  ('Admissions Open 2024-25', 'Join Kerala''s Premier Educational Institution - DHSE Code: 11181', 'Apply Now', '/admissions', 2),
  ('Nurturing Excellence Since Foundation', 'Private Unaided Institution by Crescent Educational Trust', 'Our Legacy', '/about', 3);