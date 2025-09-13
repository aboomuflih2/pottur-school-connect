-- Fix staff_counts RLS policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all operations for admin users" ON staff_counts;
DROP POLICY IF EXISTS "Enable read access for anon" ON staff_counts;

-- Create new policies
CREATE POLICY "Enable all operations for admin users" ON staff_counts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable read access for anon" ON staff_counts
  FOR SELECT
  TO anon
  USING (true);

-- Insert initial data if table is empty
INSERT INTO staff_counts (teaching_staff, security_staff, professional_staff, guides_staff)
SELECT 20, 4, 12, 2
WHERE NOT EXISTS (SELECT 1 FROM staff_counts LIMIT 1);

SELECT 'Staff counts RLS policies fixed' as status;