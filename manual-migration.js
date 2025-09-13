import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function manualMigration() {
  try {
    console.log('Starting manual migration...');
    
    // First, backup existing data
    console.log('Backing up existing data...');
    const { data: existingData, error: fetchError } = await supabase
      .from('academic_programs')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching existing data:', fetchError);
      return;
    }
    
    console.log(`Found ${existingData?.length || 0} existing programs`);
    console.log('Existing data:', JSON.stringify(existingData, null, 2));
    
    // Since we can't execute raw SQL, let's try to work with the existing table
    // and add the missing columns if possible
    
    // Check if main_image column exists by trying to select it
    console.log('Checking if main_image column exists...');
    const { data: testData, error: testError } = await supabase
      .from('academic_programs')
      .select('main_image')
      .limit(1);
    
    if (testError) {
      console.log('main_image column does not exist:', testError.message);
      console.log('\n=== MANUAL MIGRATION REQUIRED ===');
      console.log('The database schema needs to be updated manually.');
      console.log('\nOption 1: Use Supabase Dashboard');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the migration SQL from 016_fix_academic_programs_schema.sql');
      console.log('\nOption 2: Use local database tools');
      console.log('1. Connect to your local PostgreSQL instance');
      console.log('2. Run the migration SQL directly');
      console.log('\nMigration SQL needed:');
      console.log('-- Drop and recreate table with new schema');
      console.log('-- Add main_image, icon_image columns');
      console.log('-- Update column names: program_name -> program_title');
      
      return;
    } else {
      console.log('main_image column exists! Schema is already updated.');
      
      // Check current data structure
      const { data: currentData, error: currentError } = await supabase
        .from('academic_programs')
        .select('*')
        .limit(1);
      
      if (currentError) {
        console.error('Error checking current structure:', currentError);
      } else {
        console.log('Current table structure:', currentData?.[0] ? Object.keys(currentData[0]) : 'No data');
        
        // Check if we have any programs with images
        const { data: programsWithImages, error: imageError } = await supabase
          .from('academic_programs')
          .select('program_title, main_image')
          .not('main_image', 'is', null);
        
        if (imageError) {
          console.error('Error checking images:', imageError);
        } else {
          console.log(`Found ${programsWithImages?.length || 0} programs with images`);
          if (programsWithImages && programsWithImages.length > 0) {
            console.log('Programs with images:', programsWithImages);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

manualMigration();