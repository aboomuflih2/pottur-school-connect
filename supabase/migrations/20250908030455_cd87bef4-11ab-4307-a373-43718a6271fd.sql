-- Create school_stats table for dynamic statistics management
CREATE TABLE public.school_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  value INTEGER NOT NULL,
  suffix TEXT DEFAULT '',
  icon_name TEXT NOT NULL DEFAULT 'Trophy',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.school_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for school stats
CREATE POLICY "Anyone can read active school stats" 
ON public.school_stats 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage school stats" 
ON public.school_stats 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_school_stats_updated_at
BEFORE UPDATE ON public.school_stats
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert initial data based on current hardcoded values
INSERT INTO public.school_stats (label, value, suffix, icon_name, display_order) VALUES
('Students Enrolled', 500, '+', 'Users', 1),
('Years of Excellence', 25, '+', 'Award', 2),
('Pass Rate', 100, '%', 'BookOpen', 3),
('Academic Awards', 50, '+', 'Trophy', 4);