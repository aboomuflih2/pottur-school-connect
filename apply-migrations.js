import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Use service role to bypass RLS
const supabase = createClient(
  'http://127.0.0.1:54323',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZn7aDF4JdgLMS7qHlNNjZMz65lRXaQjf42c'
);

async function createMissingTables() {
  console.log('🚀 Creating missing tables with correct schemas...');
  
  // Create interview_subject_templates table
  console.log('\n=== Creating interview_subject_templates table ===');
  const createTemplatesSQL = `
    CREATE TABLE IF NOT EXISTS public.interview_subject_templates (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      form_type text NOT NULL CHECK (form_type IN ('kg_std','plus_one')),
      subject_name text NOT NULL,
      max_marks integer NOT NULL DEFAULT 25,
      display_order integer NOT NULL DEFAULT 0,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    
    ALTER TABLE public.interview_subject_templates ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Public read interview templates" ON public.interview_subject_templates;
    CREATE POLICY "Public read interview templates" ON public.interview_subject_templates
      FOR SELECT USING (true);
    
    GRANT SELECT ON public.interview_subject_templates TO anon;
    GRANT ALL ON public.interview_subject_templates TO authenticated;
  `;
  
  try {
    const { error } = await supabase.rpc('exec', { sql: createTemplatesSQL });
    if (error) {
      console.error('Error creating interview_subject_templates:', error);
    } else {
      console.log('✅ interview_subject_templates table created');
    }
  } catch (err) {
    console.error('Failed to create interview_subject_templates:', err.message);
  }
  
  // Add missing columns to interview_subjects
  console.log('\n=== Updating interview_subjects table ===');
  const updateSubjectsSQL = `
    ALTER TABLE public.interview_subjects
      ADD COLUMN IF NOT EXISTS application_type text,
      ADD COLUMN IF NOT EXISTS subject_name text,
      ADD COLUMN IF NOT EXISTS marks integer,
      ADD COLUMN IF NOT EXISTS max_marks integer DEFAULT 25;
  `;
  
  try {
    const { error } = await supabase.rpc('exec', { sql: updateSubjectsSQL });
    if (error) {
      console.error('Error updating interview_subjects:', error);
    } else {
      console.log('✅ interview_subjects table updated');
    }
  } catch (err) {
    console.error('Failed to update interview_subjects:', err.message);
  }
  
  // Add missing columns to kg_std_applications
  console.log('\n=== Updating kg_std_applications table ===');
  const updateKgStdSQL = `
    ALTER TABLE public.kg_std_applications
      ADD COLUMN IF NOT EXISTS stage text,
      ADD COLUMN IF NOT EXISTS need_madrassa boolean,
      ADD COLUMN IF NOT EXISTS previous_madrassa text,
      ADD COLUMN IF NOT EXISTS has_siblings boolean,
      ADD COLUMN IF NOT EXISTS siblings_names text;
  `;
  
  try {
    const { error } = await supabase.rpc('exec', { sql: updateKgStdSQL });
    if (error) {
      console.error('Error updating kg_std_applications:', error);
    } else {
      console.log('✅ kg_std_applications table updated');
    }
  } catch (err) {
    console.error('Failed to update kg_std_applications:', err.message);
  }
  
  console.log('\n✅ Schema updates completed!');
}

createMissingTables().catch(console.error);