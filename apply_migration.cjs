const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('Checking current column structure...');
    
    // First, let's check what columns exist by trying to select them
    let hasMarksObtained = false;
    let hasMarks = false;
    
    try {
      const { data, error } = await supabase
        .from('interview_subjects')
        .select('marks_obtained')
        .limit(1);
      
      if (!error) {
        hasMarksObtained = true;
        console.log('marks_obtained column exists');
      }
    } catch (e) {
      console.log('marks_obtained column does not exist');
    }
    
    try {
      const { data, error } = await supabase
        .from('interview_subjects')
        .select('marks')
        .limit(1);
      
      if (!error) {
        hasMarks = true;
        console.log('marks column exists');
      }
    } catch (e) {
      console.log('marks column does not exist');
    }
    
    if (hasMarksObtained && !hasMarks) {
      console.log('Migration needed: marks_obtained exists but marks does not');
      console.log('Please run the following SQL manually in your Supabase SQL editor:');
      console.log('ALTER TABLE interview_subjects RENAME COLUMN marks_obtained TO marks;');
      console.log('');
      console.log('Or apply the migration file: supabase/migrations/037_rename_marks_obtained_to_marks.sql');
    } else if (hasMarks && !hasMarksObtained) {
      console.log('Migration already applied: marks column exists');
    } else if (hasMarks && hasMarksObtained) {
      console.log('Both columns exist - this is unexpected');
    } else {
      console.log('Neither column exists - table structure may be different');
    }
    
    // Check templates
    console.log('\nChecking interview_subject_templates...');
    const { data: templates, error: templatesError } = await supabase
      .from('interview_subject_templates')
      .select('*')
      .eq('is_active', true);
      
    if (templatesError) {
      console.error('Error fetching templates:', templatesError);
    } else {
      console.log(`Found ${templates?.length || 0} active templates`);
      if (templates && templates.length > 0) {
        const kgStd = templates.filter(t => t.form_type === 'kg_std');
        const plusOne = templates.filter(t => t.form_type === 'plus_one');
        console.log(`- KG/STD: ${kgStd.length} templates`);
        console.log(`- Plus One: ${plusOne.length} templates`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

applyMigration();