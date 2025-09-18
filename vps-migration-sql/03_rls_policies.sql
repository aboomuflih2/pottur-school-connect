-- VPS Database RLS Policies Migration
-- Generated: 2025-09-18T04:56:07.316Z

ALTER TABLE academic_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_forms_legacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaking_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_subject_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE kg_std_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leadership_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE plus_one_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admin full access on academic_programs
DROP POLICY IF EXISTS "Allow admin full access" ON academic_programs;
CREATE POLICY "Allow admin full access" ON academic_programs TO "public" USING ((auth.uid() IN ( SELECT user_roles.user_id
   FROM user_roles
  WHERE (user_roles.role = 'admin'::text))));

-- Policy: Allow public read access on academic_programs
DROP POLICY IF EXISTS "Allow public read access" ON academic_programs;
CREATE POLICY "Allow public read access" ON academic_programs FOR SELECT TO "public" USING (true);

-- Policy: Allow admin full access to admission_forms on admission_forms
DROP POLICY IF EXISTS "Allow admin full access to admission_forms" ON admission_forms;
CREATE POLICY "Allow admin full access to admission_forms" ON admission_forms TO "public" USING (is_admin()) WITH CHECK (is_admin());

-- Policy: Allow public read admission forms on admission_forms
DROP POLICY IF EXISTS "Allow public read admission forms" ON admission_forms;
CREATE POLICY "Allow public read admission forms" ON admission_forms FOR SELECT TO "public" USING (true);

-- Policy: Allow admin full access to admission_forms on admission_forms_legacy
DROP POLICY IF EXISTS "Allow admin full access to admission_forms" ON admission_forms_legacy;
CREATE POLICY "Allow admin full access to admission_forms" ON admission_forms_legacy TO "public" USING (is_admin()) WITH CHECK (is_admin());

-- Policy: Anyone can submit admission forms on admission_forms_legacy
DROP POLICY IF EXISTS "Anyone can submit admission forms" ON admission_forms_legacy;
CREATE POLICY "Anyone can submit admission forms" ON admission_forms_legacy FOR INSERT TO "public" WITH CHECK (true);

-- Policy: Authenticated users can manage comments on article_comments
DROP POLICY IF EXISTS "Authenticated users can manage comments" ON article_comments;
CREATE POLICY "Authenticated users can manage comments" ON article_comments TO "public" USING ((auth.role() = 'authenticated'::text));

-- Policy: Public can read approved comments on article_comments
DROP POLICY IF EXISTS "Public can read approved comments" ON article_comments;
CREATE POLICY "Public can read approved comments" ON article_comments FOR SELECT TO "public" USING ((is_approved = true));

-- Policy: Public can submit comments on article_comments
DROP POLICY IF EXISTS "Public can submit comments" ON article_comments;
CREATE POLICY "Public can submit comments" ON article_comments FOR INSERT TO "public" WITH CHECK (true);

-- Policy: Admin full access on article_likes
DROP POLICY IF EXISTS "Admin full access" ON article_likes;
CREATE POLICY "Admin full access" ON article_likes TO "public" USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));

-- Policy: Public can like articles on article_likes
DROP POLICY IF EXISTS "Public can like articles" ON article_likes;
CREATE POLICY "Public can like articles" ON article_likes FOR INSERT TO "public" WITH CHECK (true);

-- Policy: Public read access on article_likes
DROP POLICY IF EXISTS "Public read access" ON article_likes;
CREATE POLICY "Public read access" ON article_likes FOR SELECT TO "public" USING (true);

-- Policy: Allow admin read audit logs on audit_logs
DROP POLICY IF EXISTS "Allow admin read audit logs" ON audit_logs;
CREATE POLICY "Allow admin read audit logs" ON audit_logs FOR SELECT TO "public" USING ((auth.uid() IN ( SELECT user_roles.user_id
   FROM user_roles
  WHERE (user_roles.role = 'admin'::text))));

-- Policy: Allow system insert audit logs on audit_logs
DROP POLICY IF EXISTS "Allow system insert audit logs" ON audit_logs;
CREATE POLICY "Allow system insert audit logs" ON audit_logs FOR INSERT TO "public" WITH CHECK (true);

-- Policy: Active breaking news is viewable by everyone on breaking_news
DROP POLICY IF EXISTS "Active breaking news is viewable by everyone" ON breaking_news;
CREATE POLICY "Active breaking news is viewable by everyone" ON breaking_news FOR SELECT TO "public" USING ((is_active = true));

-- Policy: Admin full access on breaking_news
DROP POLICY IF EXISTS "Admin full access" ON breaking_news;
CREATE POLICY "Admin full access" ON breaking_news TO "public" USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));

-- Policy: Enable all operations for admin users on breaking_news
DROP POLICY IF EXISTS "Enable all operations for admin users" ON breaking_news;
CREATE POLICY "Enable all operations for admin users" ON breaking_news TO "authenticated" USING (true) WITH CHECK (true);

-- Policy: Enable read access for anon on breaking_news
DROP POLICY IF EXISTS "Enable read access for anon" ON breaking_news;
CREATE POLICY "Enable read access for anon" ON breaking_news FOR SELECT TO "anon" USING (true);

-- Policy: Public read access on breaking_news
DROP POLICY IF EXISTS "Public read access" ON breaking_news;
CREATE POLICY "Public read access" ON breaking_news FOR SELECT TO "public" USING (true);

-- Policy: Admin full access on contact_submissions
DROP POLICY IF EXISTS "Admin full access" ON contact_submissions;
CREATE POLICY "Admin full access" ON contact_submissions TO "public" USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));

-- Policy: Allow admin full access to contact_submissions on contact_submissions
DROP POLICY IF EXISTS "Allow admin full access to contact_submissions" ON contact_submissions;
CREATE POLICY "Allow admin full access to contact_submissions" ON contact_submissions TO "public" USING (is_admin());

-- Policy: Allow all for testing on contact_submissions
DROP POLICY IF EXISTS "Allow all for testing" ON contact_submissions;
CREATE POLICY "Allow all for testing" ON contact_submissions TO "public" USING (true) WITH CHECK (true);

-- Policy: Enable all operations for admin users on contact_submissions
DROP POLICY IF EXISTS "Enable all operations for admin users" ON contact_submissions;
CREATE POLICY "Enable all operations for admin users" ON contact_submissions TO "authenticated" USING (true) WITH CHECK (true);

-- Policy: Enable read access for anon on contact_submissions
DROP POLICY IF EXISTS "Enable read access for anon" ON contact_submissions;
CREATE POLICY "Enable read access for anon" ON contact_submissions FOR SELECT TO "anon" USING (true);

-- Policy: Public read access on contact_submissions
DROP POLICY IF EXISTS "Public read access" ON contact_submissions;
CREATE POLICY "Public read access" ON contact_submissions FOR SELECT TO "public" USING (true);

-- Policy: Admin full access on events
DROP POLICY IF EXISTS "Admin full access" ON events;
CREATE POLICY "Admin full access" ON events TO "public" USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));

-- Policy: Public read access on events
DROP POLICY IF EXISTS "Public read access" ON events;
CREATE POLICY "Public read access" ON events FOR SELECT TO "public" USING (true);

-- Policy: events_delete_policy on events
DROP POLICY IF EXISTS "events_delete_policy" ON events;
CREATE POLICY "events_delete_policy" ON events FOR DELETE TO "public" USING ((auth.role() = 'authenticated'::text));

-- Policy: events_insert_policy on events
DROP POLICY IF EXISTS "events_insert_policy" ON events;
CREATE POLICY "events_insert_policy" ON events FOR INSERT TO "public" WITH CHECK ((auth.role() = 'authenticated'::text));

-- Policy: events_select_policy on events
DROP POLICY IF EXISTS "events_select_policy" ON events;
CREATE POLICY "events_select_policy" ON events FOR SELECT TO "public" USING (true);

-- Policy: events_update_policy on events
DROP POLICY IF EXISTS "events_update_policy" ON events;
CREATE POLICY "events_update_policy" ON events FOR UPDATE TO "public" USING ((auth.role() = 'authenticated'::text));

-- Policy: Admin full access on gallery_photos
DROP POLICY IF EXISTS "Admin full access" ON gallery_photos;
CREATE POLICY "Admin full access" ON gallery_photos TO "public" USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));

-- Policy: Allow admin full gallery access on gallery_photos
DROP POLICY IF EXISTS "Allow admin full gallery access" ON gallery_photos;
CREATE POLICY "Allow admin full gallery access" ON gallery_photos TO "public" USING (is_admin()) WITH CHECK (is_admin());

-- Policy: Allow public read gallery on gallery_photos
DROP POLICY IF EXISTS "Allow public read gallery" ON gallery_photos;
CREATE POLICY "Allow public read gallery" ON gallery_photos FOR SELECT TO "public" USING (true);

-- Policy: Public read access on gallery_photos
DROP POLICY IF EXISTS "Public read access" ON gallery_photos;
CREATE POLICY "Public read access" ON gallery_photos FOR SELECT TO "public" USING (true);

-- Policy: Allow admin full access to hero_slides on hero_slides
DROP POLICY IF EXISTS "Allow admin full access to hero_slides" ON hero_slides;
CREATE POLICY "Allow admin full access to hero_slides" ON hero_slides TO "public" USING (is_admin());

-- Policy: Allow all for testing on hero_slides
DROP POLICY IF EXISTS "Allow all for testing" ON hero_slides;
CREATE POLICY "Allow all for testing" ON hero_slides TO "public" USING (true) WITH CHECK (true);

-- Policy: Allow public read access to active hero_slides on hero_slides
DROP POLICY IF EXISTS "Allow public read access to active hero_slides" ON hero_slides;
CREATE POLICY "Allow public read access to active hero_slides" ON hero_slides FOR SELECT TO "public" USING ((is_active = true));

-- Policy: Enable all operations for admin users on hero_slides
DROP POLICY IF EXISTS "Enable all operations for admin users" ON hero_slides;
CREATE POLICY "Enable all operations for admin users" ON hero_slides TO "authenticated" USING (true) WITH CHECK (true);

-- Policy: Enable delete for admin users on hero_slides
DROP POLICY IF EXISTS "Enable delete for admin users" ON hero_slides;
CREATE POLICY "Enable delete for admin users" ON hero_slides FOR DELETE TO "public" USING (is_admin());

-- Policy: Enable insert for admin users on hero_slides
DROP POLICY IF EXISTS "Enable insert for admin users" ON hero_slides;
CREATE POLICY "Enable insert for admin users" ON hero_slides FOR INSERT TO "public" WITH CHECK (is_admin());

-- Policy: Enable read access for all users on hero_slides
DROP POLICY IF EXISTS "Enable read access for all users" ON hero_slides;
CREATE POLICY "Enable read access for all users" ON hero_slides FOR SELECT TO "public" USING (true);

-- Policy: Enable read access for anon on hero_slides
DROP POLICY IF EXISTS "Enable read access for anon" ON hero_slides;
CREATE POLICY "Enable read access for anon" ON hero_slides FOR SELECT TO "anon" USING (true);

-- Policy: Enable update for admin users on hero_slides
DROP POLICY IF EXISTS "Enable update for admin users" ON hero_slides;
CREATE POLICY "Enable update for admin users" ON hero_slides FOR UPDATE TO "public" USING (is_admin());

-- Policy: Allow admin full access to interview templates on interview_subject_templates
DROP POLICY IF EXISTS "Allow admin full access to interview templates" ON interview_subject_templates;
CREATE POLICY "Allow admin full access to interview templates" ON interview_subject_templates TO "public" USING (is_admin()) WITH CHECK (is_admin());

-- Policy: Public read access on interview_subject_templates
DROP POLICY IF EXISTS "Public read access" ON interview_subject_templates;
CREATE POLICY "Public read access" ON interview_subject_templates FOR SELECT TO "public" USING (true);

-- Policy: Allow admin full access to interview subjects on interview_subjects
DROP POLICY IF EXISTS "Allow admin full access to interview subjects" ON interview_subjects;
CREATE POLICY "Allow admin full access to interview subjects" ON interview_subjects TO "public" USING (is_admin()) WITH CHECK (is_admin());

-- Policy: Public read access on interview_subjects
DROP POLICY IF EXISTS "Public read access" ON interview_subjects;
CREATE POLICY "Public read access" ON interview_subjects FOR SELECT TO "public" USING (true);

-- Policy: Allow admin full access to kg_std on kg_std_applications
DROP POLICY IF EXISTS "Allow admin full access to kg_std" ON kg_std_applications;
CREATE POLICY "Allow admin full access to kg_std" ON kg_std_applications TO "public" USING (is_admin()) WITH CHECK (is_admin());

-- Policy: Public can submit kg_std applications on kg_std_applications
DROP POLICY IF EXISTS "Public can submit kg_std applications" ON kg_std_applications;
CREATE POLICY "Public can submit kg_std applications" ON kg_std_applications FOR INSERT TO "public" WITH CHECK (true);

-- Policy: Public read access on kg_std_applications
DROP POLICY IF EXISTS "Public read access" ON kg_std_applications;
CREATE POLICY "Public read access" ON kg_std_applications FOR SELECT TO "public" USING (true);

-- Policy: Enable all operations for anon on leadership_messages
DROP POLICY IF EXISTS "Enable all operations for anon" ON leadership_messages;
CREATE POLICY "Enable all operations for anon" ON leadership_messages TO "anon" USING (true) WITH CHECK (true);

-- Policy: Enable all operations for authenticated on leadership_messages
DROP POLICY IF EXISTS "Enable all operations for authenticated" ON leadership_messages;
CREATE POLICY "Enable all operations for authenticated" ON leadership_messages TO "authenticated" USING (true) WITH CHECK (true);

-- Policy: Allow admin full access to news_posts on news_posts
DROP POLICY IF EXISTS "Allow admin full access to news_posts" ON news_posts;
CREATE POLICY "Allow admin full access to news_posts" ON news_posts TO "public" USING (is_admin());

-- Policy: Allow all for testing on news_posts
DROP POLICY IF EXISTS "Allow all for testing" ON news_posts;
CREATE POLICY "Allow all for testing" ON news_posts TO "public" USING (true) WITH CHECK (true);

-- Policy: Allow public read access to published news_posts on news_posts
DROP POLICY IF EXISTS "Allow public read access to published news_posts" ON news_posts;
CREATE POLICY "Allow public read access to published news_posts" ON news_posts FOR SELECT TO "public" USING ((is_published = true));

-- Policy: Authenticated users can manage news posts on news_posts
DROP POLICY IF EXISTS "Authenticated users can manage news posts" ON news_posts;
CREATE POLICY "Authenticated users can manage news posts" ON news_posts TO "public" USING ((auth.role() = 'authenticated'::text));

-- Policy: Enable all operations for admin users on news_posts
DROP POLICY IF EXISTS "Enable all operations for admin users" ON news_posts;
CREATE POLICY "Enable all operations for admin users" ON news_posts TO "authenticated" USING (true) WITH CHECK (true);

-- Policy: Enable read access for anon on news_posts
DROP POLICY IF EXISTS "Enable read access for anon" ON news_posts;
CREATE POLICY "Enable read access for anon" ON news_posts FOR SELECT TO "anon" USING (true);

-- Policy: Published news posts are viewable by everyone on news_posts
DROP POLICY IF EXISTS "Published news posts are viewable by everyone" ON news_posts;
CREATE POLICY "Published news posts are viewable by everyone" ON news_posts FOR SELECT TO "public" USING ((is_published = true));

-- Policy: news_posts_delete_policy on news_posts
DROP POLICY IF EXISTS "news_posts_delete_policy" ON news_posts;
CREATE POLICY "news_posts_delete_policy" ON news_posts FOR DELETE TO "public" USING ((auth.role() = 'authenticated'::text));

-- Policy: news_posts_insert_policy on news_posts
DROP POLICY IF EXISTS "news_posts_insert_policy" ON news_posts;
CREATE POLICY "news_posts_insert_policy" ON news_posts FOR INSERT TO "public" WITH CHECK ((auth.role() = 'authenticated'::text));

-- Policy: news_posts_select_policy on news_posts
DROP POLICY IF EXISTS "news_posts_select_policy" ON news_posts;
CREATE POLICY "news_posts_select_policy" ON news_posts FOR SELECT TO "public" USING (true);

-- Policy: news_posts_update_policy on news_posts
DROP POLICY IF EXISTS "news_posts_update_policy" ON news_posts;
CREATE POLICY "news_posts_update_policy" ON news_posts FOR UPDATE TO "public" USING ((auth.role() = 'authenticated'::text));

-- Policy: Enable all operations for admin users on page_content
DROP POLICY IF EXISTS "Enable all operations for admin users" ON page_content;
CREATE POLICY "Enable all operations for admin users" ON page_content TO "authenticated" USING (true) WITH CHECK (true);

-- Policy: Enable all operations for anon users on page_content
DROP POLICY IF EXISTS "Enable all operations for anon users" ON page_content;
CREATE POLICY "Enable all operations for anon users" ON page_content TO "anon" USING (true) WITH CHECK (true);

-- Policy: Enable read access for anon on page_content
DROP POLICY IF EXISTS "Enable read access for anon" ON page_content;
CREATE POLICY "Enable read access for anon" ON page_content FOR SELECT TO "anon" USING (true);

-- Policy: Allow admin full access to plus_one on plus_one_applications
DROP POLICY IF EXISTS "Allow admin full access to plus_one" ON plus_one_applications;
CREATE POLICY "Allow admin full access to plus_one" ON plus_one_applications TO "public" USING (is_admin()) WITH CHECK (is_admin());

-- Policy: Public can submit plus_one applications on plus_one_applications
DROP POLICY IF EXISTS "Public can submit plus_one applications" ON plus_one_applications;
CREATE POLICY "Public can submit plus_one applications" ON plus_one_applications FOR INSERT TO "public" WITH CHECK (true);

-- Policy: Public read access on plus_one_applications
DROP POLICY IF EXISTS "Public read access" ON plus_one_applications;
CREATE POLICY "Public read access" ON plus_one_applications FOR SELECT TO "public" USING (true);

-- Policy: Admin full access on school_features
DROP POLICY IF EXISTS "Admin full access" ON school_features;
CREATE POLICY "Admin full access" ON school_features TO "public" USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));

-- Policy: Public read access on school_features
DROP POLICY IF EXISTS "Public read access" ON school_features;
CREATE POLICY "Public read access" ON school_features FOR SELECT TO "public" USING (true);

-- Policy: Allow admin full access to school_stats on school_stats
DROP POLICY IF EXISTS "Allow admin full access to school_stats" ON school_stats;
CREATE POLICY "Allow admin full access to school_stats" ON school_stats TO "public" USING (is_admin());

-- Policy: Allow public read access to school_stats on school_stats
DROP POLICY IF EXISTS "Allow public read access to school_stats" ON school_stats;
CREATE POLICY "Allow public read access to school_stats" ON school_stats FOR SELECT TO "public" USING (true);

-- Policy: Admin full access on social_media_links
DROP POLICY IF EXISTS "Admin full access" ON social_media_links;
CREATE POLICY "Admin full access" ON social_media_links TO "public" USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));

-- Policy: Public read access on social_media_links
DROP POLICY IF EXISTS "Public read access" ON social_media_links;
CREATE POLICY "Public read access" ON social_media_links FOR SELECT TO "public" USING (true);

-- Policy: Admin full access on staff_counts
DROP POLICY IF EXISTS "Admin full access" ON staff_counts;
CREATE POLICY "Admin full access" ON staff_counts TO "public" USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));

-- Policy: Enable all operations for admin users on staff_counts
DROP POLICY IF EXISTS "Enable all operations for admin users" ON staff_counts;
CREATE POLICY "Enable all operations for admin users" ON staff_counts TO "authenticated" USING (true) WITH CHECK (true);

-- Policy: Enable read access for anon on staff_counts
DROP POLICY IF EXISTS "Enable read access for anon" ON staff_counts;
CREATE POLICY "Enable read access for anon" ON staff_counts FOR SELECT TO "anon" USING (true);

-- Policy: Public read access on staff_counts
DROP POLICY IF EXISTS "Public read access" ON staff_counts;
CREATE POLICY "Public read access" ON staff_counts FOR SELECT TO "public" USING (true);

-- Policy: Admin full access on testimonials
DROP POLICY IF EXISTS "Admin full access" ON testimonials;
CREATE POLICY "Admin full access" ON testimonials TO "public" USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));

-- Policy: Allow admin full access to testimonials on testimonials
DROP POLICY IF EXISTS "Allow admin full access to testimonials" ON testimonials;
CREATE POLICY "Allow admin full access to testimonials" ON testimonials TO "public" USING (is_admin());

-- Policy: Allow all for testing on testimonials
DROP POLICY IF EXISTS "Allow all for testing" ON testimonials;
CREATE POLICY "Allow all for testing" ON testimonials TO "public" USING (true) WITH CHECK (true);

-- Policy: Allow public read access to testimonials on testimonials
DROP POLICY IF EXISTS "Allow public read access to testimonials" ON testimonials;
CREATE POLICY "Allow public read access to testimonials" ON testimonials FOR SELECT TO "public" USING (true);

-- Policy: Enable all operations for admin users on testimonials
DROP POLICY IF EXISTS "Enable all operations for admin users" ON testimonials;
CREATE POLICY "Enable all operations for admin users" ON testimonials TO "authenticated" USING (true) WITH CHECK (true);

-- Policy: Enable read access for anon on testimonials
DROP POLICY IF EXISTS "Enable read access for anon" ON testimonials;
CREATE POLICY "Enable read access for anon" ON testimonials FOR SELECT TO "anon" USING (true);

-- Policy: Public read access on testimonials
DROP POLICY IF EXISTS "Public read access" ON testimonials;
CREATE POLICY "Public read access" ON testimonials FOR SELECT TO "public" USING (true);

-- Policy: Users can view their own roles on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles" ON user_roles FOR SELECT TO "public" USING ((auth.uid() = user_id));

