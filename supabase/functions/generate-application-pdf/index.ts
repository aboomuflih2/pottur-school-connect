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
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background-color: #f9f9f9; 
            }
            .letterhead {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              margin-bottom: 20px;
              text-align: center;
              border-bottom: 3px solid #2563eb;
            }
            .logo {
              max-width: 150px;
              height: auto;
              margin-bottom: 10px;
            }
            .school-name {
              font-size: 18px;
              font-weight: bold;
              color: #1e40af;
              margin: 10px 0;
            }
            .contact-info {
              font-size: 11px;
              color: #6b7280;
              line-height: 1.4;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { 
              color: #1e40af; 
              border-bottom: 2px solid #2563eb; 
              padding-bottom: 10px; 
            }
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
          <div class="letterhead">
            <img src="/lovable-uploads/d526aeda-08eb-46c2-a4d1-d0a41f2fe9de.png" alt="School Logo" class="logo">
            <div class="school-name">MODERN HIGHER SECONDARY SCHOOL, POTTUR</div>
            <div class="contact-info">
              Mudur P.O., Vattamkulam Via, Edappal, Malappuram, Kerala - 679578<br>
              Email: modernpotur@gmail.com | Phone: 0494-2699645, 96454 99921<br>
              DHSE Code: 11181
            </div>
          </div>
          
          <div class="content">
            <h1>Application Summary</h1>
            
            <div class="application-details">
              <div class="detail-group">
                <div class="label">Application Number:</div>
                <div class="value">${application.application_number || 'N/A'}</div>
              </div>
              
              <div class="detail-group">
                <div class="label">Student Name:</div>
                <div class="value">${application.full_name || 'N/A'}</div>
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
            <p>This is a computer-generated document from Modern Higher Secondary School, Pottur and does not require a signature.</p>
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