# Database Migration Instructions

## Issue Diagnosis

The academic program images are not displaying because of a **database schema mismatch**:

- **Current Schema**: `program_name`, `program_description` (old structure)
- **Expected Schema**: `program_title`, `main_image`, `short_description`, `full_description` (new structure)

## Solution: Run Database Migration

### Step 1: Access Supabase Dashboard

1. Open your browser and go to: **http://127.0.0.1:54325**
2. This will open your local Supabase dashboard

### Step 2: Navigate to SQL Editor

1. In the Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"** to create a new SQL query

### Step 3: Run the Migration SQL

1. Copy the entire contents of the file: `supabase/migrations/016_fix_academic_programs_schema.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** to execute the migration

### Step 4: Verify Migration Success

After running the migration, you should see:
- The `academic_programs` table recreated with the correct schema
- 6 new academic programs inserted with proper data structure
- Storage policies configured for the `program-icons` bucket

### Step 5: Test the Admin Interface

1. Go back to your admin interface
2. Navigate to the Academic Programs section
3. Try uploading an image to verify the functionality works

## What the Migration Does

1. **Drops the old table** and recreates it with the correct schema
2. **Adds new columns**: `program_title`, `main_image`, `icon_image`, `short_description`, `full_description`, `subjects`
3. **Inserts 6 academic programs** with proper data structure:
   - Pre-School (KG 1 & KG 2)
   - Primary School (Standards 1 - 4)
   - UP School (Standards 5 - 7)
   - Moral Studies
   - High School (Standards 8 - 10)
   - Higher Secondary (Plus One & Plus Two)
4. **Configures storage policies** for the `program-icons` bucket
5. **Sets up proper permissions** for anonymous and authenticated users

## Current Status

✅ **Storage bucket exists**: `program-icons` bucket is properly configured
✅ **Migration SQL ready**: All necessary SQL is prepared
❌ **Schema mismatch**: Database needs migration
❌ **RLS policies**: Need to be updated for storage uploads

## After Migration

Once the migration is complete:
1. The admin interface will be able to upload images
2. Images will display correctly in the academic programs page
3. All CRUD operations will work as expected

---

**Note**: This migration will replace all existing academic program data with the new structure. The old data will be lost, but new comprehensive data will be inserted.