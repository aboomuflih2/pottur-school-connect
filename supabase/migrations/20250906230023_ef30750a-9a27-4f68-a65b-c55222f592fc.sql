-- Create admission forms configuration table
CREATE TABLE public.admission_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL UNIQUE CHECK (form_type IN ('kg_std', 'plus_one')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  academic_year TEXT NOT NULL DEFAULT '2025-26',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create KG & STD applications table
CREATE TABLE public.kg_std_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_number TEXT NOT NULL UNIQUE,
  
  -- Student Details
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('LKG', 'UKG', 'STD 1', 'STD 2', 'STD 3', 'STD 4', 'STD 5', 'STD 6', 'STD 7', 'STD 8', 'STD 9', 'STD 10')),
  
  -- Madrassa Details (conditional)
  need_madrassa BOOLEAN DEFAULT false,
  previous_madrassa TEXT,
  
  -- Parent Details
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  
  -- Address
  house_name TEXT NOT NULL,
  post_office TEXT NOT NULL,
  village TEXT NOT NULL,
  pincode TEXT NOT NULL,
  district TEXT NOT NULL,
  
  -- Contact
  email TEXT,
  mobile_number TEXT NOT NULL,
  
  -- Previous School (conditional)
  previous_school TEXT,
  
  -- Siblings
  has_siblings BOOLEAN DEFAULT false,
  siblings_names TEXT,
  
  -- Status and tracking
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted_for_interview', 'interview_complete', 'admitted', 'not_admitted')),
  interview_date TIMESTAMP WITH TIME ZONE,
  interview_time TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create +1 / HSS applications table
CREATE TABLE public.plus_one_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_number TEXT NOT NULL UNIQUE,
  
  -- Personal Details
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE NOT NULL,
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  
  -- Address
  house_name TEXT NOT NULL,
  landmark TEXT,
  post_office TEXT NOT NULL,
  village TEXT NOT NULL,
  pincode TEXT NOT NULL,
  district TEXT NOT NULL,
  
  -- Contact
  email TEXT,
  mobile_number TEXT NOT NULL,
  
  -- Academic Details
  tenth_school TEXT NOT NULL,
  board TEXT NOT NULL CHECK (board IN ('SSLC', 'CBSE', 'Other')),
  exam_roll_number TEXT NOT NULL,
  exam_year TEXT NOT NULL,
  
  -- Stream Choice
  stream TEXT NOT NULL CHECK (stream IN ('biology_science', 'computer_science', 'commerce')),
  
  -- Siblings
  has_siblings BOOLEAN DEFAULT false,
  siblings_names TEXT,
  
  -- Status and tracking
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted_for_interview', 'interview_complete', 'admitted', 'not_admitted')),
  interview_date TIMESTAMP WITH TIME ZONE,
  interview_time TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interview subjects table
CREATE TABLE public.interview_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  application_type TEXT NOT NULL CHECK (application_type IN ('kg_std', 'plus_one')),
  subject_name TEXT NOT NULL,
  marks INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(application_id, application_type, subject_name)
);

-- Enable RLS on all tables
ALTER TABLE public.admission_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kg_std_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plus_one_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_subjects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admission_forms
CREATE POLICY "Anyone can read admission forms" ON public.admission_forms FOR SELECT USING (true);
CREATE POLICY "Admins can manage admission forms" ON public.admission_forms FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for kg_std_applications
CREATE POLICY "Anyone can create KG STD applications" ON public.kg_std_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read their own KG STD application by mobile" ON public.kg_std_applications FOR SELECT USING (true);
CREATE POLICY "Admins can manage all KG STD applications" ON public.kg_std_applications FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for plus_one_applications
CREATE POLICY "Anyone can create Plus One applications" ON public.plus_one_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read their own Plus One application by mobile" ON public.plus_one_applications FOR SELECT USING (true);
CREATE POLICY "Admins can manage all Plus One applications" ON public.plus_one_applications FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for interview_subjects
CREATE POLICY "Admins can manage interview subjects" ON public.interview_subjects FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_admission_forms_updated_at BEFORE UPDATE ON public.admission_forms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_kg_std_applications_updated_at BEFORE UPDATE ON public.kg_std_applications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_plus_one_applications_updated_at BEFORE UPDATE ON public.plus_one_applications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_interview_subjects_updated_at BEFORE UPDATE ON public.interview_subjects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default admission forms configuration
INSERT INTO public.admission_forms (form_type, is_active, academic_year) VALUES
('kg_std', true, '2026-27'),
('plus_one', true, '2025-26');