-- Create interview subject templates table
CREATE TABLE public.interview_subject_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL CHECK (form_type IN ('kg_std', 'plus_one')),
  subject_name TEXT NOT NULL,
  max_marks INTEGER NOT NULL DEFAULT 25,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.interview_subject_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for interview subject templates
CREATE POLICY "Admins can manage interview subject templates" 
ON public.interview_subject_templates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read active interview subject templates" 
ON public.interview_subject_templates 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_interview_subject_templates_updated_at
BEFORE UPDATE ON public.interview_subject_templates
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default subjects for KG & STD
INSERT INTO public.interview_subject_templates (form_type, subject_name, max_marks, display_order) VALUES
('kg_std', 'Cognitive Skills', 25, 1),
('kg_std', 'Motor Skills', 25, 2),
('kg_std', 'Social Interaction', 25, 3),
('kg_std', 'Communication Skills', 25, 4);

-- Insert default subjects for Plus One
INSERT INTO public.interview_subject_templates (form_type, subject_name, max_marks, display_order) VALUES
('plus_one', 'Physics', 25, 1),
('plus_one', 'Chemistry', 25, 2),
('plus_one', 'Mathematics', 25, 3),
('plus_one', 'General Aptitude', 25, 4),
('plus_one', 'Communication Skills', 25, 5);