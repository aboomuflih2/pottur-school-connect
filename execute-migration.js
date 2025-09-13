import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeMigration() {
  try {
    console.log('Starting manual migration...');
    
    // Step 1: Backup existing data
    console.log('\n1. Backing up existing data...');
    const { data: existingPrograms, error: backupError } = await supabase
      .from('academic_programs')
      .select('*');
    
    if (backupError) {
      console.error('Error backing up data:', backupError);
      return;
    }
    
    console.log(`Backed up ${existingPrograms.length} programs`);
    
    // Step 2: Since we can't execute raw SQL, let's try to work with what we have
    // First, let's check if we can add the missing columns
    console.log('\n2. Checking current schema...');
    
    // Try to select with new column names to see if they exist
    const { data: testData, error: testError } = await supabase
      .from('academic_programs')
      .select('program_title, main_image')
      .limit(1);
    
    if (testError && testError.message.includes('column')) {
      console.log('New columns do not exist. Manual database migration required.');
      console.log('\n=== MANUAL MIGRATION STEPS ===');
      console.log('Since we cannot execute raw SQL through the Supabase client,');
      console.log('you need to manually run the migration in your database.');
      console.log('\nOptions:');
      console.log('1. Access your local PostgreSQL database directly');
      console.log('2. Use Supabase Dashboard SQL Editor');
      console.log('3. Use a database management tool like pgAdmin');
      console.log('\nMigration SQL file: supabase/migrations/016_fix_academic_programs_schema.sql');
      
      // Let's try a workaround - create the new data structure manually
      console.log('\n=== ATTEMPTING WORKAROUND ===');
      console.log('Trying to insert new data with correct structure...');
      
      // Try to insert one record with new structure to test
      const newPrograms = [
        {
          program_title: 'Pre-School (KG 1 & KG 2)',
          short_description: 'Foundation learning through play-based activities and early childhood development programs.',
          full_description: 'Our Pre-School program provides a nurturing environment for children aged 3-5 years.',
          subjects: ['Basic Literacy', 'Numeracy', 'Art & Craft', 'Music & Movement'],
          duration: '2 Years',
          main_image: null,
          icon_image: null,
          is_active: true,
          display_order: 1
        }
      ];
      
      const { data: insertData, error: insertError } = await supabase
        .from('academic_programs')
        .insert(newPrograms)
        .select();
      
      if (insertError) {
        console.error('Insert test failed:', insertError);
        console.log('\nThe database schema definitely needs manual migration.');
      } else {
        console.log('Insert test successful! New schema might be working.');
        console.log('Inserted data:', insertData);
      }
    } else {
      console.log('New columns exist! Schema migration was successful.');
      console.log('Test data:', testData);
    }
    
    // Step 3: Verify final schema
    console.log('\n3. Final schema verification...');
    const { data: finalData, error: finalError } = await supabase
      .from('academic_programs')
      .select('*')
      .limit(1);
    
    if (finalError) {
      console.error('Final verification error:', finalError);
    } else {
      console.log('Current table structure:');
      if (finalData && finalData.length > 0) {
        console.log('Columns:', Object.keys(finalData[0]));
      } else {
        console.log('No data in table');
      }
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

executeMigration();