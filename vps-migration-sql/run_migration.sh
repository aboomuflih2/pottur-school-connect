#!/bin/bash
# VPS Migration Execution Script
# Run this script on your VPS to apply the migration

echo "🚀 Starting VPS database migration..."

echo "
1️⃣ Creating schema..."
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 01_schema.sql

echo "
2️⃣ Inserting data..."
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 02_data.sql

echo "
3️⃣ Setting up RLS policies..."
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 03_rls_policies.sql

echo "
4️⃣ Creating functions..."
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 04_functions.sql

echo "
5️⃣ Setting permissions..."
psql -h 63.250.52.6 -p 5432 -U postgres -d postgres -f 05_permissions.sql

echo "
✅ Migration completed!"
echo "
📋 Next steps:"
echo "1. Get Supabase API keys from http://63.250.52.6:3000"
echo "2. Update .env.vps with actual keys"
echo "3. Test your application"
