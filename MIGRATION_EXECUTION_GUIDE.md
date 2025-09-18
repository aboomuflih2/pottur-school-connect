# 🚀 Database Migration Execution Guide

## ⚠️ IMPORTANT: Manual Migration Required

**Direct PostgreSQL connection to VPS is blocked (port 5432 not accessible).**
**Migration must be executed manually via Supabase Studio.**

## ✅ Pre-Migration Status
- ✅ Local database backed up
- ✅ VPS Supabase API responding (requires API key)
- ✅ Migration files ready in `vps-migration-sql/`
- ❌ Direct PostgreSQL connection blocked

## 🎯 Step-by-Step Migration Process

### Step 1: Access Supabase Studio
1. Open your browser
2. Navigate to: **http://63.250.52.6:3000**
3. Login to Supabase Studio

### Step 2: Execute Migration Files (IN ORDER)

#### File 1: Schema Creation
1. Go to **SQL Editor** in Supabase Studio
2. Open file: `vps-migration-sql/01_schema.sql`
3. Copy the entire content
4. Paste into SQL Editor
5. Click **Run** button
6. ✅ Verify: Should create 24 tables

#### File 2: Data Migration
1. Open file: `vps-migration-sql/02_data.sql`
2. Copy the entire content
3. Paste into SQL Editor
4. Click **Run** button
5. ✅ Verify: Should insert 31 rows across 8 tables

#### File 3: Security Policies
1. Open file: `vps-migration-sql/03_rls_policies.sql`
2. Copy the entire content
3. Paste into SQL Editor
4. Click **Run** button
5. ✅ Verify: Should create 88 RLS policies

#### File 4: Database Functions
1. Open file: `vps-migration-sql/04_functions.sql`
2. Copy the entire content
3. Paste into SQL Editor
4. Click **Run** button
5. ✅ Verify: Should create 3 functions

#### File 5: Permissions
1. Open file: `vps-migration-sql/05_permissions.sql`
2. Copy the entire content
3. Paste into SQL Editor
4. Click **Run** button
5. ✅ Verify: Should grant permissions to anon/authenticated roles

### Step 3: Get API Keys
1. In Supabase Studio, go to **Settings → API**
2. Copy these keys:
   - **anon** key (public)
   - **service_role** key (private)

### Step 4: Update Environment Configuration
1. Open `.env.vps` file
2. Replace placeholder keys with actual keys:
```env
VITE_SUPABASE_URL="http://63.250.52.6:8000"
VITE_SUPABASE_ANON_KEY="your-actual-anon-key-here"
VITE_SUPABASE_SERVICE_ROLE_KEY="your-actual-service-role-key-here"
VPS_DATABASE_URL="postgresql://postgres:Modern#2025@63.250.52.6:5432/postgres"
```

### Step 5: Test Migration
1. Verify data in Supabase Studio:
   - Check **Table Editor**
   - Confirm all 24 tables exist
   - Verify data in key tables:
     - `academic_programs` (6 rows)
     - `admission_forms` (2 rows)
     - `kg_std_applications` (4 rows)
     - `leadership_messages` (3 rows)
     - `page_content` (4 rows)
     - `plus_one_applications` (7 rows)
     - `staff_counts` (1 row)
     - `user_roles` (4 rows)

## 🔍 Verification Checklist

After each step, verify:
- [ ] **Schema**: 24 tables created
- [ ] **Data**: 31 rows inserted
- [ ] **Security**: 88 RLS policies active
- [ ] **Functions**: 3 functions available
- [ ] **Permissions**: anon/authenticated roles configured
- [ ] **API Keys**: Retrieved from Supabase Studio
- [ ] **Environment**: `.env.vps` updated with real keys

## 🚨 If Errors Occur

### Common Issues:
1. **Syntax Error**: Check for missing semicolons or quotes
2. **Permission Denied**: Ensure you're logged in as admin
3. **Table Exists**: Some tables might already exist (safe to ignore)
4. **Function Error**: Check if extensions are enabled

### Recovery Options:
1. **Partial Failure**: Continue with remaining files
2. **Complete Failure**: Use `rollback-migration.js --confirm`
3. **Data Issues**: Restore from `./database-backup/`

## 📊 Expected Results

### Tables with Data:
- `academic_programs`: 6 rows
- `admission_forms`: 2 rows
- `kg_std_applications`: 4 rows
- `leadership_messages`: 3 rows
- `page_content`: 4 rows
- `plus_one_applications`: 7 rows
- `staff_counts`: 1 row
- `user_roles`: 4 rows

### Empty Tables (16 tables):
- All other tables will be empty but ready for use

## ✅ Success Indicators

1. **No SQL errors** in Supabase Studio
2. **All tables visible** in Table Editor
3. **Data present** in 8 key tables
4. **API keys obtained** from Settings
5. **Environment updated** with real keys

---

**Next Step**: After successful migration, test your application with VPS database!

**Estimated Time**: 15-20 minutes for manual execution
**Difficulty**: Medium (requires careful copy-paste)
**Risk**: Low (backup available for rollback)