import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { applicationNumber, applicationType } = await req.json();

    if (!applicationNumber || !applicationType) {
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
    const { data: application, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('application_number', applicationNumber)
      .single();

    if (error || !application) {
      return new Response(
        JSON.stringify({ error: 'Application not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
            .school-name { font-size: 24px; font-weight: bold; color: #0066cc; margin-bottom: 5px; }
            .app-title { font-size: 18px; margin-top: 10px; }
            .app-number { background: #f0f8ff; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; color: #0066cc; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
            .field-group { display: flex; margin-bottom: 10px; }
            .field-label { font-weight: bold; width: 150px; }
            .field-value { flex: 1; }
            .address-section { background: #f9f9f9; padding: 15px; border-radius: 5px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">Al Ameen Higher Secondary School</div>
            <div>Application Summary</div>
            <div class="app-title">${applicationType === 'kg_std' ? 'KG & STD' : '+1 / HSS'} Application</div>
          </div>

          <div class="app-number">
            <strong>Application Number: ${application.application_number}</strong>
          </div>

          <div class="section">
            <div class="section-title">Personal Information</div>
            <div class="field-group">
              <div class="field-label">Full Name:</div>
              <div class="field-value">${application.full_name}</div>
            </div>
            <div class="field-group">
              <div class="field-label">Date of Birth:</div>
              <div class="field-value">${application.date_of_birth}</div>
            </div>
            <div class="field-group">
              <div class="field-label">Gender:</div>
              <div class="field-value">${application.gender}</div>
            </div>
            <div class="field-group">
              <div class="field-label">Mobile:</div>
              <div class="field-value">${application.mobile_number}</div>
            </div>
            ${application.email ? `
            <div class="field-group">
              <div class="field-label">Email:</div>
              <div class="field-value">${application.email}</div>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">Parent Information</div>
            <div class="field-group">
              <div class="field-label">Father's Name:</div>
              <div class="field-value">${application.father_name}</div>
            </div>
            <div class="field-group">
              <div class="field-label">Mother's Name:</div>
              <div class="field-value">${application.mother_name}</div>
            </div>
          </div>

          <div class="section address-section">
            <div class="section-title">Address Information</div>
            <div class="field-group">
              <div class="field-label">House Name:</div>
              <div class="field-value">${application.house_name}</div>
            </div>
            <div class="field-group">
              <div class="field-label">Panchayath:</div>
              <div class="field-value">${application.village}</div>
            </div>
            <div class="field-group">
              <div class="field-label">Post Office:</div>
              <div class="field-value">${application.post_office}</div>
            </div>
            <div class="field-group">
              <div class="field-label">District:</div>
              <div class="field-value">${application.district}</div>
            </div>
            <div class="field-group">
              <div class="field-label">Pincode:</div>
              <div class="field-value">${application.pincode}</div>
            </div>
          </div>

          ${applicationType === 'kg_std' ? `
          <div class="section">
            <div class="section-title">Educational Information</div>
            <div class="field-group">
              <div class="field-label">Stage:</div>
              <div class="field-value">${application.stage}</div>
            </div>
            ${application.previous_school ? `
            <div class="field-group">
              <div class="field-label">Previous School:</div>
              <div class="field-value">${application.previous_school}</div>
            </div>
            ` : ''}
            ${application.need_madrassa ? `
            <div class="field-group">
              <div class="field-label">Need Madrassa:</div>
              <div class="field-value">Yes</div>
            </div>
            ` : ''}
          </div>
          ` : `
          <div class="section">
            <div class="section-title">Educational Information</div>
            <div class="field-group">
              <div class="field-label">Stream:</div>
              <div class="field-value">${application.stream}</div>
            </div>
            <div class="field-group">
              <div class="field-label">10th School:</div>
              <div class="field-value">${application.tenth_school}</div>
            </div>
            <div class="field-group">
              <div class="field-label">Board:</div>
              <div class="field-value">${application.board}</div>
            </div>
            <div class="field-group">
              <div class="field-label">Exam Year:</div>
              <div class="field-value">${application.exam_year}</div>
            </div>
            <div class="field-group">
              <div class="field-label">Roll Number:</div>
              <div class="field-value">${application.exam_roll_number}</div>
            </div>
          </div>
          `}

          <div class="footer">
            <p>Application submitted on: ${new Date(application.created_at).toLocaleDateString()}</p>
            <p>This is a computer-generated document and does not require a signature.</p>
          </div>
        </body>
      </html>
    `;

    // For now, return the HTML content that can be used to generate PDF on frontend
    // In a production environment, you would use a service like Puppeteer to generate actual PDF
    return new Response(
      JSON.stringify({ 
        success: true, 
        htmlContent,
        applicationData: application
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-application-pdf function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});