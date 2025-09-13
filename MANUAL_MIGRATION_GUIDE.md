# Manual Database Migration Required

## Problem
The `academic_programs` table has an incorrect schema that doesn't match the admin interface expectations. The table is missing the `full_description` column and other required fields.

## Solution
You need to manually run the migration SQL in the Supabase Dashboard.

## Step-by-Step Instructions

### 1. Access Supabase Dashboard
- Open your browser and go to: **http://127.0.0.1:54325**
- This is your local Supabase instance

### 2. Navigate to SQL Editor
- In the Supabase Dashboard, click on **"SQL Editor"** in the left sidebar
- Click **"New Query"** to create a new SQL query

### 3. Copy and Execute Migration SQL
- Open the file: `supabase/migrations/016_fix_academic_programs_schema.sql`
- Copy the entire contents of this file
- Paste it into the SQL Editor in Supabase Dashboard
- Click **"Run"** to execute the migration

### 4. Verify Migration Success
After running the migration, you should see:
- The `academic_programs` table recreated with correct schema
- 6 academic programs inserted (Pre-School, Primary School, UP School, Moral Studies, High School, Higher Secondary)
- Storage policies configured for the `program-icons` bucket

### 5. Test the Admin Interface
- Go to: **http://localhost:5173/admin/academics**
- You should now see the 6 academic programs listed
- Test image upload functionality for each program
- Verify content editing works correctly

## What the Migration Does

1. **Drops the old table** with incorrect schema
2. **Creates new table** with correct columns:
   - `id` (UUID primary key)
   - `program_title` (text)
   - `short_description` (text)
   - `full_description` (text)
   - `detailed_description` (text)
   - `subjects` (text array)
   - `duration` (text)
   - `main_image` (text)
   - `icon_image` (text)
   - `is_active` (boolean)
   - `display_order` (integer)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

3. **Enables Row Level Security (RLS)**
4. **Creates access policies** for public read and admin full access
5. **Grants permissions** to anon and authenticated roles
6. **Inserts 6 academic programs** with sample data
7. **Configures storage policies** for the `program-icons` bucket

## After Migration

Once the migration is complete:
- The academic page content will be restored
- You can upload images for each program
- Content management will work properly
- The frontend will display programs correctly

## Troubleshooting

If you encounter any errors:
1. Make sure you're connected to the local Supabase instance
2. Check that the SQL Editor has proper permissions
3. Run the migration SQL in smaller chunks if needed
4. Contact support if issues persist

---

**Status**: Manual migration required - automated approaches failed due to Supabase client limitations.
**Next Steps**: Follow the manual instructions above to restore the academic programs functionality.