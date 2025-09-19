import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type ApplicationRecord = Record<string, unknown> & {
  id: string;
  application_number: string;
  mobile_number: string;
};

type InterviewSubject = {
  subject_name: string;
  marks_obtained: number | null;
  max_marks: number | null;
  display_order: number | null;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { applicationNumber, mobileNumber } = await req.json();

    if (typeof applicationNumber !== 'string' || typeof mobileNumber !== 'string') {
      return new Response(
        JSON.stringify({ error: 'applicationNumber and mobileNumber are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizedApplication = applicationNumber.trim();
    const sanitizedMobile = mobileNumber.trim();

    if (!sanitizedApplication || !sanitizedMobile) {
      return new Response(
        JSON.stringify({ error: 'applicationNumber and mobileNumber are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tables: Array<{ name: 'kg_std_applications' | 'plus_one_applications'; formType: 'kg_std' | 'plus_one' }> = [
      { name: 'kg_std_applications', formType: 'kg_std' },
      { name: 'plus_one_applications', formType: 'plus_one' },
    ];

    let application: ApplicationRecord | null = null;
    let applicationType: 'kg_std' | 'plus_one' | null = null;

    for (const table of tables) {
      const { data, error } = await supabase
        .from<ApplicationRecord>(table.name)
        .select('*')
        .eq('application_number', sanitizedApplication)
        .eq('mobile_number', sanitizedMobile)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error(`Error querying ${table.name}:`, error);
        return new Response(
          JSON.stringify({ error: 'Failed to load application' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (data) {
        application = data;
        applicationType = table.formType;
        break;
      }
    }

    if (!application || !applicationType) {
      return new Response(
        JSON.stringify({ error: 'Application not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: formMeta } = await supabase
      .from('admission_forms')
      .select('academic_year')
      .eq('form_type', applicationType)
      .maybeSingle();

    const { data: interviewSubjects, error: interviewError } = await supabase
      .from<InterviewSubject>('interview_subjects')
      .select('subject_name, marks_obtained, max_marks, display_order')
      .eq('application_id', application.id)
      .eq('application_type', applicationType)
      .order('display_order', { ascending: true });

    if (interviewError && interviewError.code !== 'PGRST116') {
      console.error('Error loading interview subjects:', interviewError);
    }

    const safeApplication = Object.fromEntries(
      Object.entries(application).filter(([_, value]) => value !== null && value !== undefined)
    );

    return new Response(
      JSON.stringify({
        application: safeApplication,
        applicationType,
        academicYear: formMeta?.academic_year ?? null,
        interviewMarks: interviewSubjects ?? [],
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('get-application-status error:', error);
    return new Response(
      JSON.stringify({ error: 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
