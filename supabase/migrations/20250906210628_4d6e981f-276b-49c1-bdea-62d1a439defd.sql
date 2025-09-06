-- Update existing testimonials to approved status so they show on the website
UPDATE public.testimonials 
SET status = 'approved' 
WHERE status = 'pending';