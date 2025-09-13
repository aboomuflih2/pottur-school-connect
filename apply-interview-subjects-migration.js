import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Try local Supabase first, then remote
const localUrl = 'http://127.0.0.1:54323';
const localServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const remoteUrl = process.env.VITE_SUPABASE_URL;
const remoteServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

async function applyMigration() {
  console.log('🚀 Applying interview subjects migration...');
  
  // Try local first
  let supabase = createClient(localUrl, localServiceKey);
  let isLocal = true;
  
  try {
    // Test connection
    const { data, error } = await supabase.from('interview_subject_templates').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Connected to local Supabase');
  } catch (error) {
    console.log('❌ Local Supabase not available, trying remote...');
    if (!remoteUrl || !remoteServiceKey) {
      console.error('❌ No remote Supabase configuration found');
      process.exit(1);
    }
    supabase = createClient(remoteUrl, remoteServiceKey);
    isLocal = false;
    console.log('✅ Connected to remote Supabase');
  }
  
  try {
    // Read and execute the migration
    const migrationSQL = readFileSync('supabase/migrations/039_insert_default_interview_subjects.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        console.log('Executing:', trimmedStatement.substring(0, 100) + '...');
        
        if (trimmedStatement.startsWith('INSERT')) {
          // Parse INSERT statement manually for better error handling
          const { error } = await supabase.rpc('exec_sql', { sql_query: trimmedStatement });
          if (error) {
            console.error('Error executing INSERT:', error);
            // Try direct insert as fallback
            await insertSubjectsDirectly(supabase);
          } else {
            console.log('✅ INSERT executed successfully');
          }
        } else {
          const { error } = await supabase.rpc('exec_sql', { sql_query: trimmedStatement });
          if (error) {
            console.error('Error executing statement:', error);
          } else {
            console.log('✅ Statement executed successfully');
          }
        }
      }
    }
    
    // Verify the data was inserted
    const { data: templates, error: selectError } = await supabase
      .from('interview_subject_templates')
      .select('*')
      .order('form_type', { ascending: true })
      .order('display_order', { ascending: true });
      
    if (selectError) {
      console.error('Error verifying data:', selectError);
    } else {
      console.log('\n📋 Interview subject templates:');
      templates.forEach(template => {
        console.log(`  ${template.form_type}: ${template.subject_name} (${template.max_marks} marks)`);
      });
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function insertSubjectsDirectly(supabase) {
  console.log('📝 Inserting subjects directly...');
  
  const kgStdSubjects = [
    { form_type: 'kg_std', subject_name: 'English', max_marks: 25, display_order: 1, is_active: true },
    { form_type: 'kg_std', subject_name: 'Mathematics', max_marks: 25, display_order: 2, is_active: true },
    { form_type: 'kg_std', subject_name: 'General Knowledge', max_marks: 25, display_order: 3, is_active: true },
    { form_type: 'kg_std', subject_name: 'Reasoning', max_marks: 25, display_order: 4, is_active: true }
  ];
  
  const plusOneSubjects = [
    { form_type: 'plus_one', subject_name: 'English', max_marks: 25, display_order: 1, is_active: true },
    { form_type: 'plus_one', subject_name: 'Mathematics', max_marks: 25, display_order: 2, is_active: true },
    { form_type: 'plus_one', subject_name: 'Science', max_marks: 25, display_order: 3, is_active: true },
    { form_type: 'plus_one', subject_name: 'Social Studies', max_marks: 25, display_order: 4, is_active: true },
    { form_type: 'plus_one', subject_name: 'General Knowledge', max_marks: 25, display_order: 5, is_active: true }
  ];
  
  for (const subject of [...kgStdSubjects, ...plusOneSubjects]) {
    const { error } = await supabase
      .from('interview_subject_templates')
      .upsert(subject, { onConflict: 'form_type,subject_name' });
      
    if (error) {
      console.error(`Error inserting ${subject.form_type} - ${subject.subject_name}:`, error);
    } else {
      console.log(`✅ Inserted ${subject.form_type} - ${subject.subject_name}`);
    }
  }
}

applyMigration();