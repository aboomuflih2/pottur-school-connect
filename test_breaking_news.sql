-- Test breaking news data
INSERT INTO public.breaking_news (title, content, message, is_active, link_url, link_text, is_external) 
VALUES 
('Academic Year', 'New semester begins', 'Welcome to our new academic year! Classes begin next Monday.', true, '/academics', 'View Academic Calendar', false),
('Parent Meeting', 'Important announcement', 'Important: Parent-teacher meeting scheduled for this Friday.', true, 'https://example.com/meeting', 'Join Meeting', true);