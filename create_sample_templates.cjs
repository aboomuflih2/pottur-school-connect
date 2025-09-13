const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSampleTemplates() {
  try {
    console.log('Checking existing templates...');
    
    // Check all templates (active and inactive)
    const { data: allTemplates, error: allError } = await supabase
      .from('interview_subject_templates')
      .select('*');
      
    if (allError) {
      console.error('Error fetching templates:', allError);
      return;
    }
    
    console.log(`Found ${allTemplates?.length || 0} total templates`);
    
    if (allTemplates && allTemplates.length > 0) {
      console.log('Existing templates:');
      allTemplates.forEach(t => {
        console.log(`- ${t.form_type}: ${t.subject_name} (${t.max_marks} marks) - Active: ${t.is_active}`);
      });
      
      // If templates exist but are inactive, activate them
      const inactiveTemplates = allTemplates.filter(t => !t.is_active);
      if (inactiveTemplates.length > 0) {
        console.log('\nActivating existing templates...');
        const { error: updateError } = await supabase
          .from('interview_subject_templates')
          .update({ is_active: true })
          .in('id', inactiveTemplates.map(t => t.id));
          
        if (updateError) {
          console.error('Error activating templates:', updateError);
        } else {
          console.log('Templates activated successfully!');
        }
      }
    } else {
      console.log('No templates found. Creating sample templates...');
      
      const sampleTemplates = [
        {
          form_type: 'kg_std',
          subject_name: 'English',
          max_marks: 25,
          display_order: 1,
          is_active: true
        },
        {
          form_type: 'kg_std',
          subject_name: 'Mathematics',
          max_marks: 25,
          display_order: 2,
          is_active: true
        },
        {
          form_type: 'kg_std',
          subject_name: 'General Knowledge',
          max_marks: 25,
          display_order: 3,
          is_active: true
        },
        {
          form_type: 'kg_std',
          subject_name: 'Drawing',
          max_marks: 25,
          display_order: 4,
          is_active: true
        },
        {
          form_type: 'plus_one',
          subject_name: 'Physics',
          max_marks: 25,
          display_order: 1,
          is_active: true
        },
        {
          form_type: 'plus_one',
          subject_name: 'Chemistry',
          max_marks: 25,
          display_order: 2,
          is_active: true
        },
        {
          form_type: 'plus_one',
          subject_name: 'Mathematics',
          max_marks: 25,
          display_order: 3,
          is_active: true
        },
        {
          form_type: 'plus_one',
          subject_name: 'English',
          max_marks: 25,
          display_order: 4,
          is_active: true
        }
      ];
      
      const { error: insertError } = await supabase
        .from('interview_subject_templates')
        .insert(sampleTemplates);
        
      if (insertError) {
        console.error('Error inserting sample templates:', insertError);
      } else {
        console.log('Sample templates created successfully!');
      }
    }
    
    // Final verification
    const { data: finalTemplates, error: finalError } = await supabase
      .from('interview_subject_templates')
      .select('*')
      .eq('is_active', true);
      
    if (finalError) {
      console.error('Error in final verification:', finalError);
    } else {
      console.log(`\nFinal result: ${finalTemplates?.length || 0} active templates`);
      if (finalTemplates && finalTemplates.length > 0) {
        const kgStd = finalTemplates.filter(t => t.form_type === 'kg_std');
        const plusOne = finalTemplates.filter(t => t.form_type === 'plus_one');
        console.log(`- KG/STD: ${kgStd.length} templates`);
        console.log(`- Plus One: ${plusOne.length} templates`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createSampleTemplates();