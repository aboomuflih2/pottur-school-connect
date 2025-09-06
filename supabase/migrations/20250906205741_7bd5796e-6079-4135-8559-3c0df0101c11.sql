-- Create leadership_messages table for Chairman, Principal, Vice Principal
CREATE TABLE public.leadership_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position TEXT NOT NULL CHECK (position IN ('chairman', 'principal', 'vice_principal')),
  person_name TEXT NOT NULL,
  person_title TEXT NOT NULL,
  message_content TEXT NOT NULL,
  photo_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(position)
);

-- Create staff_counts table for team statistics
CREATE TABLE public.staff_counts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teaching_staff INTEGER NOT NULL DEFAULT 0,
  security_staff INTEGER NOT NULL DEFAULT 0,
  professional_staff INTEGER NOT NULL DEFAULT 0,
  guides_staff INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create school_features table for "Why Choose Us" section
CREATE TABLE public.school_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_title TEXT NOT NULL,
  feature_description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add status column to testimonials for moderation
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Enable RLS on new tables
ALTER TABLE public.leadership_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_features ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leadership_messages
CREATE POLICY "Anyone can read active leadership messages" 
ON public.leadership_messages 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage leadership messages" 
ON public.leadership_messages 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for staff_counts
CREATE POLICY "Anyone can read staff counts" 
ON public.staff_counts 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage staff counts" 
ON public.staff_counts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for school_features
CREATE POLICY "Anyone can read active school features" 
ON public.school_features 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage school features" 
ON public.school_features 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update testimonials policies to handle status
DROP POLICY IF EXISTS "Anyone can read active testimonials" ON public.testimonials;
CREATE POLICY "Anyone can read approved testimonials" 
ON public.testimonials 
FOR SELECT 
USING (is_active = true AND status = 'approved');

-- Create updated_at triggers
CREATE TRIGGER update_leadership_messages_updated_at
BEFORE UPDATE ON public.leadership_messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_staff_counts_updated_at
BEFORE UPDATE ON public.staff_counts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_school_features_updated_at
BEFORE UPDATE ON public.school_features
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default staff counts record
INSERT INTO public.staff_counts (teaching_staff, security_staff, professional_staff, guides_staff)
VALUES (25, 8, 12, 6);

-- Insert default school features
INSERT INTO public.school_features (feature_title, feature_description, icon_name, display_order) VALUES
('Experienced Faculty', 'Our dedicated teachers bring years of experience and passion for education to every classroom.', 'GraduationCap', 1),
('Modern Infrastructure', 'State-of-the-art facilities and learning environments designed to enhance the educational experience.', 'Building2', 2),
('Holistic Development', 'We focus on developing not just academic excellence but also character, values, and life skills.', 'Users', 3),
('Individual Attention', 'Small class sizes ensure every student receives personalized attention and support.', 'Eye', 4),
('Co-curricular Activities', 'Rich variety of sports, arts, and cultural activities to nurture diverse talents and interests.', 'Trophy', 5),
('Safe Environment', 'Secure campus with comprehensive safety measures ensuring peace of mind for parents.', 'Shield', 6);

-- Insert about us page content entries
INSERT INTO public.page_content (page_key, page_title, content, meta_description) VALUES
('about_legacy', 'Our Legacy', 'Modern Higher Secondary School, Pottur, stands as a beacon of quality education in Malappuram district. Established under the Crescent Educational Trust, our institution has been nurturing young minds and shaping future leaders for over two decades. Our journey began with a vision to provide comprehensive education that blends academic excellence with moral values, preparing our students for the challenges of tomorrow.', 'Learn about the rich history and legacy of Modern Higher Secondary School, Pottur'),
('about_mission', 'Our Mission', 'To provide quality education that empowers students with knowledge, skills, and values necessary for their personal growth and success in life. We are committed to fostering a learning environment that encourages critical thinking, creativity, and character development while maintaining the highest standards of academic excellence.', 'Our mission at Modern Higher Secondary School, Pottur'),
('about_vision', 'Our Vision', 'To be recognized as a leading educational institution that produces confident, competent, and compassionate individuals who contribute positively to society. We envision a future where our students become lifelong learners and responsible citizens who make meaningful contributions to their communities and the world at large.', 'Our vision for the future at Modern Higher Secondary School, Pottur');

-- Insert default leadership messages
INSERT INTO public.leadership_messages (position, person_name, person_title, message_content, display_order) VALUES
('chairman', 'Mohammed Kutty', 'Chairman', 'Welcome to Modern Higher Secondary School, Pottur. As Chairman of this esteemed institution, I am proud of our commitment to educational excellence and character building. Our school has consistently maintained high standards in both academics and moral education, preparing students for a bright future. We believe in nurturing not just intelligent minds, but also compassionate hearts that will serve society with dedication and integrity.', 1),
('principal', 'Dr. Rashida Beevi', 'Principal', 'It gives me immense pleasure to welcome you to our school family. As Principal, I am dedicated to creating an environment where every student can discover their potential and excel in their chosen path. Our experienced faculty and modern facilities provide the perfect foundation for holistic development. We encourage our students to dream big, work hard, and become the leaders of tomorrow.', 2),
('vice_principal', 'Ashraf Ali', 'Vice Principal', 'At Modern Higher Secondary School, we believe that education is not just about academic achievement, but about developing well-rounded individuals. Our comprehensive approach to education ensures that students gain knowledge, develop skills, and build character. I am committed to supporting our students in their journey of discovery and growth, helping them become confident and capable citizens.', 3);