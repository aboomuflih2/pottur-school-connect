-- Create social_media_links table
CREATE TABLE public.social_media_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'youtube', 'twitter', 'linkedin', 'tiktok')),
  url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.social_media_links ENABLE ROW LEVEL SECURITY;

-- Create policies for social media links
CREATE POLICY "Admins can manage social media links" 
ON public.social_media_links 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read active social media links" 
ON public.social_media_links 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_social_media_links_updated_at
BEFORE UPDATE ON public.social_media_links
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert some default social media links
INSERT INTO public.social_media_links (platform, url, display_order) VALUES
('facebook', 'https://facebook.com/yourschool', 1),
('instagram', 'https://instagram.com/yourschool', 2),
('youtube', 'https://youtube.com/yourschool', 3),
('twitter', 'https://twitter.com/yourschool', 4);