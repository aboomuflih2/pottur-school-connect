-- Check if user_roles table exists and query admin users
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles';

-- Check if there are any admin users
SELECT * FROM user_roles WHERE role = 'admin';

-- Check all users in user_roles table
SELECT * FROM user_roles;

-- Check auth.users table to see registered users
SELECT id, email, created_at FROM auth.users;