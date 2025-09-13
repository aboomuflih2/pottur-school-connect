import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseKey ? 'Present' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchemaFix() {
  try {
    console.log('Starting schema migration...');
    console.log('Connecting to:', supabaseUrl);
    
    // First, let's check the current table structure
    console.log('Checking current table structure...');
    const { data: currentData, error: fetchError } = await supabase
      .from('academic_programs')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.error('Error fetching current data:', fetchError);
      return;
    }
    
    console.log('Current table structure:', currentData?.[0] ? Object.keys(currentData[0]) : 'No data');
    
    // Check if we have the old schema (program_name) or new schema (program_title)
    if (currentData?.[0] && 'program_name' in currentData[0]) {
      console.log('Detected old schema with program_name. Need to migrate.');
      
      // Since we can't alter the table structure directly via the client,
      // let's create a backup of the data and inform the user
      const { data: allData, error: allDataError } = await supabase
        .from('academic_programs')
        .select('*');
      
      if (allDataError) {
        console.error('Error fetching all data:', allDataError);
        return;
      }
      
      console.log('Current data in table:');
      console.log(JSON.stringify(allData, null, 2));
      
      console.log('\n=== MIGRATION NEEDED ===');
      console.log('The database schema needs to be updated manually.');
      console.log('Current schema has: program_name, program_description');
      console.log('Expected schema has: program_title, short_description, full_description, main_image');
      console.log('\nPlease run the migration 016_fix_academic_programs_schema.sql manually in your Supabase dashboard.');
      
    } else if (currentData?.[0] && 'program_title' in currentData[0]) {
      console.log('Schema is already correct with program_title!');
      
      // Check if we have image data
      const programsWithImages = currentData.filter(p => p.main_image);
      console.log(`Found ${programsWithImages.length} programs with images`);
      
    } else {
      console.log('Unable to determine current schema');
    }
    
  } catch (error) {
    console.error('Error during schema check:', error);
  }
}

applySchemaFix();