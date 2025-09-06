import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Interview letter generation function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { applicationNumber, applicationType } = await req.json();
    console.log('Request data:', { applicationNumber, applicationType });

    if (!applicationNumber || !applicationType) {
      console.error('Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Application number and type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch application data
    const tableName = applicationType === 'kg_std' ? 'kg_std_applications' : 'plus_one_applications';
    console.log('Fetching from table:', tableName);

    const { data: application, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('application_number', applicationNumber)
      .single();

    if (error || !application) {
      console.error('Application not found:', error);
      return new Response(
        JSON.stringify({ error: 'Application not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Application found:', application.full_name);

    // Check if application is eligible for interview letter
    if (application.status !== 'shortlisted_for_interview') {
      console.error('Application not shortlisted for interview');
      return new Response(
        JSON.stringify({ error: 'Application is not shortlisted for interview' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!application.interview_date) {
      console.error('Interview date not set');
      return new Response(
        JSON.stringify({ error: 'Interview date is not set' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate HTML content for Interview Call Letter PDF
    const interviewDate = new Date(application.interview_date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Times New Roman', serif; margin: 40px; color: #000; line-height: 1.6; }
            .letterhead { text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
            .school-name { font-size: 28px; font-weight: bold; color: #0066cc; margin-bottom: 5px; }
            .school-address { font-size: 14px; color: #666; margin-bottom: 10px; }
            .letter-title { font-size: 20px; font-weight: bold; margin: 30px 0; text-align: center; text-decoration: underline; }
            .date-ref { text-align: right; margin-bottom: 30px; }
            .applicant-details { background: #f8f9fa; padding: 20px; border-left: 4px solid #0066cc; margin: 20px 0; }
            .interview-details { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .important-note { background: #ffeee6; border: 1px solid #ff6b35; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .signature-section { margin-top: 50px; }
            .field-group { margin-bottom: 12px; }
            .field-label { font-weight: bold; display: inline-block; width: 150px; }
            .documents-list { margin-left: 20px; }
            .documents-list li { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <div class="school-name">Al Ameen Higher Secondary School</div>
            <div class="school-address">
              Edapal, Malappuram District, Kerala<br>
              Phone: +91 XXXX XXXXXX | Email: info@alameenschool.edu.in
            </div>
          </div>

          <div class="date-ref">
            <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}<br>
            <strong>Ref:</strong> AMHSS/ADM/${new Date().getFullYear()}/${applicationNumber}
          </div>

          <div class="letter-title">
            INTERVIEW CALL LETTER
          </div>

          <p><strong>Dear ${application.full_name},</strong></p>

          <p>Congratulations! We are pleased to inform you that your application for admission to <strong>${applicationType === 'kg_std' ? 'KG & STD' : '+1 / HSS'}</strong> class has been shortlisted for the interview process.</p>

          <div class="applicant-details">
            <h3 style="margin-top: 0; color: #0066cc;">Application Details</h3>
            <div class="field-group">
              <span class="field-label">Application No:</span>
              <span>${application.application_number}</span>
            </div>
            <div class="field-group">
              <span class="field-label">Student Name:</span>
              <span>${application.full_name}</span>
            </div>
            <div class="field-group">
              <span class="field-label">Father's Name:</span>
              <span>${application.father_name}</span>
            </div>
            <div class="field-group">
              <span class="field-label">Mother's Name:</span>
              <span>${application.mother_name}</span>
            </div>
            <div class="field-group">
              <span class="field-label">Mobile Number:</span>
              <span>${application.mobile_number}</span>
            </div>
          </div>

          <div class="interview-details">
            <h3 style="margin-top: 0; color: #856404;">Interview Schedule</h3>
            <div class="field-group">
              <span class="field-label">Date:</span>
              <span><strong>${interviewDate}</strong></span>
            </div>
            <div class="field-group">
              <span class="field-label">Time:</span>
              <span><strong>${application.interview_time || 'Will be communicated separately'}</strong></span>
            </div>
            <div class="field-group">
              <span class="field-label">Venue:</span>
              <span><strong>Al Ameen Higher Secondary School, Edapal</strong></span>
            </div>
          </div>

          <div class="important-note">
            <h3 style="margin-top: 0; color: #d63031;">Documents to Bring</h3>
            <p>Please bring the following documents on the interview day:</p>
            <ul class="documents-list">
              <li>Original Birth Certificate and one photocopy</li>
              <li>Transfer Certificate (if applicable)</li>
              <li>Previous academic records/mark sheets</li>
              <li>Recent passport-size photographs (2 nos.)</li>
              <li>This interview call letter</li>
              ${applicationType === 'plus_one' ? '<li>SSLC/10th standard certificate and mark sheet</li>' : ''}
            </ul>
          </div>

          <p><strong>Instructions:</strong></p>
          <ul>
            <li>Please report 15 minutes before the scheduled time</li>
            <li>Bring all original documents for verification</li>
            <li>Students must be accompanied by parents/guardians</li>
            <li>Mobile phones are not allowed in the interview hall</li>
            <li>For any queries, contact the school office</li>
          </ul>

          <p>We look forward to meeting you and wish you all the best for your interview.</p>

          <div class="signature-section">
            <p>Regards,</p>
            <br><br>
            <strong>Principal</strong><br>
            Al Ameen Higher Secondary School<br>
            Edapal, Malappuram
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
            <p>This is a computer-generated document. For any discrepancies, please contact the school office immediately.</p>
          </div>
        </body>
      </html>
    `;

    console.log('Interview letter HTML generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        htmlContent,
        applicationData: application,
        filename: `Interview_Call_Letter_${applicationNumber}.pdf`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-interview-letter function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});