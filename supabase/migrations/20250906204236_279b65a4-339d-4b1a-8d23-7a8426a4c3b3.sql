-- Allow public (anonymous and authenticated) users to submit contact forms
-- Make migration idempotent by dropping any existing policy with the same name
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;

-- Ensure RLS is enabled (no-op if already enabled)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy that allows anyone to insert new rows
CREATE POLICY "Anyone can submit contact forms"
ON public.contact_submissions
FOR INSERT
TO public
WITH CHECK (true);
