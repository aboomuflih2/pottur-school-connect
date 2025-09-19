-- Create storage bucket for CV uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cv-uploads',
  'cv-uploads',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to upload CVs
CREATE POLICY "Authenticated users can upload CVs" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'cv-uploads' AND
    auth.role() = 'authenticated'
  );

-- Policy for authenticated users to view their own CVs
CREATE POLICY "Users can view CVs" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'cv-uploads'
  );

-- Policy for admins to view all CVs
CREATE POLICY "Admins can view all CVs" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'cv-uploads' AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

-- Policy for admins to delete CVs
CREATE POLICY "Admins can delete CVs" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'cv-uploads' AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

-- Grant permissions to anon and authenticated roles for the bucket
GRANT SELECT ON storage.buckets TO anon, authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON