@echo off
REM VPS Migration Execution Script
REM Run this script on your VPS to apply the migration

echo Starting VPS database migration...

echo.
echo 1. Creating schema...
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 01_schema.sql

echo.
echo 2. Inserting data...
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 02_data.sql

echo.
echo 3. Setting up RLS policies...
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 03_rls_policies.sql

echo.
echo 4. Creating functions...
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 04_functions.sql

echo.
echo 5. Setting permissions...
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 05_permissions.sql

echo.
echo Migration completed!
echo.
echo Next steps:
echo 1. Get Supabase API keys from http://63.250.52.6:3000
echo 2. Update .env.vps with actual keys
echo 3. Test your application
