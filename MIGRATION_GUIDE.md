# Database Migration Guide: Local Supabase to VPS PostgreSQL

This guide provides step-by-step instructions for migrating your local Supabase database to a VPS PostgreSQL instance.

## 📋 Overview

**Source Database:** Local Supabase (Docker)
- Host: 127.0.0.1:54322
- Database: postgres
- User: postgres
- Password: postgres

**Target Database:** VPS PostgreSQL (via Supabase)
- Host: 63.250.52.6:5432
- Database: postgres
- User: postgres
- Password: Modern#2025
- Supabase API: http://63.250.52.6:8000
- Supabase Studio: http://63.250.52.6:3000

## 🚀 Migration Process

### Step 1: Backup Local Database ✅

```bash
node backup-local-db.js
```

This creates a complete backup in `./database-backup/` including:
- `schema.sql` - Table structures
- `*_data.json` - Table data for each table
- `rls_policies.json` - Row Level Security policies
- `functions.json` - Database functions

**Backup Summary:**
- 24 tables backed up
- 88 RLS policies exported
- 3 functions exported
- Total data: 31 rows across all tables

### Step 2: VPS Connection Test ✅

**Direct PostgreSQL Connection:** ❌ Connection refused (Port 5432 not accessible)
**Supabase API Connection:** ✅ Accessible but requires API key

### Step 3: Environment Configuration ✅

Created `.env.vps` with VPS database credentials:

```env
VITE_SUPABASE_URL="http://63.250.52.6:8000"
VPS_DATABASE_URL="postgresql://postgres:Modern#2025@63.250.52.6:5432/postgres"
```

## 🛠️ Migration Scripts

### Main Migration Script

```bash
node migrate-to-vps.js
```

**What it does:**
1. Tests both local and VPS connections
2. Creates all tables on VPS
3. Migrates all data
4. Sets up RLS policies
5. Grants proper permissions
6. Migrates database functions
7. Verifies migration success

### Rollback Script

```bash
node rollback-migration.js --confirm
```

**What it does:**
- Safely removes all migrated tables and functions from VPS
- Provides confirmation prompt for safety
- Verifies cleanup completion

## 📊 Database Structure

### Tables to Migrate (24 total)

1. **academic_programs** (6 rows)
2. **admission_forms** (2 rows)
3. **admission_forms_legacy** (0 rows)
4. **article_comments** (0 rows)
5. **article_likes** (0 rows)
6. **audit_logs** (0 rows)
7. **breaking_news** (0 rows)
8. **contact_submissions** (0 rows)
9. **events** (0 rows)
10. **gallery_photos** (0 rows)
11. **hero_slides** (0 rows)
12. **interview_subject_templates** (0 rows)
13. **interview_subjects** (0 rows)
14. **kg_std_applications** (4 rows)
15. **leadership_messages** (3 rows)
16. **news_posts** (0 rows)
17. **page_content** (4 rows)
18. **plus_one_applications** (7 rows)
19. **school_features** (0 rows)
20. **school_stats** (0 rows)
21. **social_media_links** (0 rows)
22. **staff_counts** (1 row)
23. **testimonials** (0 rows)
24. **user_roles** (4 rows)

### Security Features

- **88 RLS Policies** - Row Level Security for data protection
- **3 Database Functions** - Custom business logic
- **Proper Permissions** - anon and authenticated role access

## 🔧 Post-Migration Steps

### 1. Get Supabase API Keys

1. Access Supabase Studio: http://63.250.52.6:3000
2. Navigate to Settings → API
3. Copy the `anon` key and `service_role` key
4. Update `.env.vps` with actual keys:

```env
VITE_SUPABASE_ANON_KEY="your-actual-anon-key"
VITE_SUPABASE_SERVICE_ROLE_KEY="your-actual-service-role-key"
```

### 2. Test Application

1. Update your application to use `.env.vps`
2. Test all functionality:
   - User authentication
   - Data retrieval
   - Data insertion/updates
   - File uploads (if applicable)
   - RLS policy enforcement

### 3. Verify Migration

```bash
node test-vps-connection.js
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused (Port 5432)**
   - VPS PostgreSQL port may not be exposed
   - Use Supabase API instead of direct connection

2. **API Key Required**
   - Get keys from Supabase Studio
   - Update environment variables

3. **RLS Policy Conflicts**
   - Check policy syntax
   - Verify role permissions

4. **Data Mismatch**
   - Run verification script
   - Check for foreign key constraints

### Recovery Options

1. **Rollback Migration**
   ```bash
   node rollback-migration.js --confirm
   ```

2. **Restore from Backup**
   - Use files in `./database-backup/`
   - Restore to local Supabase
   - Re-run migration

## 📁 File Structure

```
├── backup-local-db.js          # Backup script
├── migrate-to-vps.js           # Main migration script
├── rollback-migration.js       # Rollback script
├── test-vps-connection.js      # Connection test
├── test-vps-supabase.js       # Supabase API test
├── .env.vps                   # VPS environment config
├── MIGRATION_GUIDE.md         # This guide
└── database-backup/           # Backup files
    ├── schema.sql
    ├── *_data.json
    ├── rls_policies.json
    └── functions.json
```

## ✅ Migration Checklist

- [x] Local database backup created
- [x] VPS connection tested
- [x] Environment configuration ready
- [x] Migration scripts prepared
- [x] Rollback scripts ready
- [ ] Run main migration
- [ ] Get Supabase API keys
- [ ] Update .env.vps with real keys
- [ ] Test application functionality
- [ ] Verify all data migrated correctly

## 🎯 Next Steps

1. **Run the migration:**
   ```bash
   node migrate-to-vps.js
   ```

2. **Get API keys from Supabase Studio**

3. **Test your application with VPS database**

4. **Update production deployment to use VPS**

---

**Note:** Always test the migration in a development environment first before running on production data.