-- Check permissions for board_members table
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'board_members' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'board_members';

-- Grant permissions if needed
GRANT SELECT ON board_members TO anon;
GRANT ALL PRIVILEGES ON board_members TO authenticated;
GRANT SELECT ON social_links TO anon;
GRANT ALL PRIVILEGES ON social_links TO authenticated;