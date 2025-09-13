-- Create admin user migration
-- First, let's check if we have any users in auth.users
-- If not, we'll need to create one through the application

-- For now, let's create a sample admin role entry
-- This assumes we'll have a user with a specific ID
-- We'll update this after we create a user through the auth system

-- Insert a placeholder admin role (will be updated with real user_id later)
-- First check if this entry already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = '00000000-0000-0000-0000-000000000000' AND role = 'admin') THEN
        INSERT INTO user_roles (user_id, role, created_at) 
        VALUES ('00000000-0000-0000-0000-000000000000', 'admin', NOW());
    END IF;
END $$;

-- Grant permissions to user_roles table
GRANT ALL PRIVILEGES ON user_roles TO anon;
GRANT ALL PRIVILEGES ON user_roles TO authenticated;

-- Create policy for admin role checking
CREATE POLICY "Allow admin role check" ON user_roles
  FOR SELECT USING (true);

-- Create policy for admin role insertion
CREATE POLICY "Allow admin role insertion" ON user_roles
  FOR INSERT WITH CHECK (true);