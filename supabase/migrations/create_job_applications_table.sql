-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    subject VARCHAR(100),
    other_designation VARCHAR(255),
    experience_years INTEGER NOT NULL DEFAULT 0,
    qualifications TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    cv_file_path VARCHAR(500),
    cover_letter TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for CV uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-uploads', 'cv-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on job_applications table
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to insert their own applications
CREATE POLICY "Users can insert job applications" ON job_applications
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view all applications (for admin)
CREATE POLICY "Authenticated users can view job applications" ON job_applications
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to update applications (for admin)
CREATE POLICY "Authenticated users can update job applications" ON job_applications
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete applications (for admin)
CREATE POLICY "Authenticated users can delete job applications" ON job_applications
    FOR DELETE USING (auth.role() = 'authenticated');

-- Storage policies for CV uploads
CREATE POLICY "Anyone can upload CVs" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'cv-uploads');

CREATE POLICY "Authenticated users can view CVs" ON storage.objects
    FOR SELECT USING (bucket_id = 'cv-uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete CVs" ON storage.objects
    FOR DELETE USING (bucket_id = 'cv-uploads' AND auth.role() = 'authenticated');

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON job_applications TO anon;
GRANT ALL PRIVILEGES ON job_applications TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_applications_designation ON job_applications(designation);
CREATE INDEX IF NOT EXISTS idx_job_applications_district ON job_applications(district);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON job_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON job_applications(email);

-- Create bulk import function
CREATE OR REPLACE FUNCTION bulk_import_job_applications(applications_data JSONB)
RETURNS TABLE(success BOOLEAN, message TEXT, imported_count INTEGER) AS $$
DECLARE
    app_record RECORD;
    imported_count INTEGER := 0;
    error_count INTEGER := 0;
    current_app JSONB;
BEGIN
    -- Validate input
    IF applications_data IS NULL OR jsonb_array_length(applications_data) = 0 THEN
        RETURN QUERY SELECT FALSE, 'No data provided for import', 0;
        RETURN;
    END IF;
    
    -- Loop through each application in the JSON array
    FOR app_record IN SELECT * FROM jsonb_array_elements(applications_data)
    LOOP
        BEGIN
            current_app := app_record.value;
            
            -- Validate required fields
            IF trim(current_app->>'full_name') IS NULL OR trim(current_app->>'full_name') = '' THEN
                error_count := error_count + 1;
                error_details := error_details || format('Row %s: Missing full_name; ', i);
                CONTINUE;
            END IF;
            
            IF trim(current_app->>'email') IS NULL OR trim(current_app->>'email') = '' THEN
                error_count := error_count + 1;
                error_details := error_details || format('Row %s: Missing email; ', i);
                CONTINUE;
            END IF;
            
            IF trim(current_app->>'phone') IS NULL OR trim(current_app->>'phone') = '' THEN
                error_count := error_count + 1;
                error_details := error_details || format('Row %s: Missing phone; ', i);
                CONTINUE;
            END IF;
            
            IF trim(current_app->>'designation') IS NULL OR trim(current_app->>'designation') = '' THEN
                error_count := error_count + 1;
                error_details := error_details || format('Row %s: Missing designation; ', i);
                CONTINUE;
            END IF;
            
            IF trim(current_app->>'qualification') IS NULL OR trim(current_app->>'qualification') = '' THEN
                error_count := error_count + 1;
                error_details := error_details || format('Row %s: Missing qualification; ', i);
                CONTINUE;
            END IF;
            
            IF trim(current_app->>'why_join') IS NULL OR trim(current_app->>'why_join') = '' THEN
                error_count := error_count + 1;
                error_details := error_details || format('Row %s: Missing why_join; ', i);
                CONTINUE;
            END IF;
            
            -- Insert each application with proper error handling
             INSERT INTO job_applications (
                 full_name, email, phone, date_of_birth, address, district,
                 designation, subject, other_designation, qualification,
                 experience_years, previous_experience, why_join
             ) VALUES (
                 trim(current_app->>'full_name'),
                 trim(current_app->>'email'),
                 trim(current_app->>'phone'),
                 CASE 
                     WHEN (current_app->>'date_of_birth') IS NOT NULL AND trim(current_app->>'date_of_birth') != ''
                     THEN (current_app->>'date_of_birth')::DATE
                     ELSE NULL
                 END,
                 trim(current_app->>'address'),
                 trim(current_app->>'district'),
                 trim(current_app->>'designation'),
                 NULLIF(trim(current_app->>'subject'), ''),
                 NULLIF(trim(current_app->>'other_designation'), ''),
                 trim(current_app->>'qualification'),
                 COALESCE((current_app->>'experience_years')::INTEGER, 0),
                 NULLIF(trim(current_app->>'previous_experience'), ''),
                 trim(current_app->>'why_join')
             );}]}}}
            
            imported_count := imported_count + 1;
            
        EXCEPTION
            WHEN OTHERS THEN
                error_count := error_count + 1;
                -- Log the error but continue processing
                RAISE NOTICE 'Error importing record: %', SQLERRM;
                CONTINUE;
        END;
    END LOOP;
    
    -- Return results
    IF imported_count > 0 THEN
        IF error_count > 0 THEN
            RETURN QUERY SELECT TRUE, 
                format('Successfully imported %s applications. %s records had errors and were skipped.', 
                       imported_count, error_count), 
                imported_count;
        ELSE
            RETURN QUERY SELECT TRUE, 
                format('Successfully imported all %s applications', imported_count), 
                imported_count;
        END IF;
    ELSE
        RETURN QUERY SELECT FALSE, 
            format('No applications were imported. %s records had errors.', error_count), 
            0;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, 
            format('Bulk import failed: %s', SQLERRM), 
            0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION bulk_import_job_applications(JSONB) TO authenticated;