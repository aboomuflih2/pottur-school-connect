-- Create job applications table
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(100) NOT NULL CHECK (designation IN ('Teaching Staff', 'Admin Staff', 'Office Staff', 'Security Staff', 'Other')),
    subject_specification VARCHAR(255),
    specify_other VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    place VARCHAR(255) NOT NULL,
    post_office VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    cv_file_path TEXT,
    cv_file_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_job_applications_designation ON job_applications(designation);
CREATE INDEX idx_job_applications_district ON job_applications(district);
CREATE INDEX idx_job_applications_created_at ON job_applications(created_at DESC);
CREATE INDEX idx_job_applications_email ON job_applications(email);
CREATE INDEX idx_job_applications_mobile ON job_applications(mobile);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- Create storage bucket for CV files
INSERT INTO storage.buckets (id, name, public) VALUES ('job-applications-cvs', 'job-applications-cvs', false);

-- Enable RLS on job_applications table
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Allow public insert for job applications (anyone can apply)
CREATE POLICY "Allow public insert" ON job_applications
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow authenticated users (admins) to view all applications
CREATE POLICY "Allow admin read" ON job_applications
    FOR SELECT TO authenticated
    USING (true);

-- Allow authenticated users (admins) to update applications
CREATE POLICY "Allow admin update" ON job_applications
    FOR UPDATE TO authenticated
    USING (true);

-- Storage policies for CV files
CREATE POLICY "Allow public upload" ON storage.objects
    FOR INSERT TO anon
    WITH CHECK (bucket_id = 'job-applications-cvs');

CREATE POLICY "Allow admin download" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'job-applications-cvs');

-- Database function for bulk import
CREATE OR REPLACE FUNCTION bulk_import_applications(
    applications_data jsonb[],
    column_mapping jsonb
)
RETURNS TABLE(imported_count integer, error_count integer, errors text[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    app_data jsonb;
    imported integer := 0;
    errors_arr text[] := '{}';
    error_count integer := 0;
BEGIN
    FOREACH app_data IN ARRAY applications_data
    LOOP
        BEGIN
            INSERT INTO job_applications (
                name, designation, subject_specification, specify_other,
                email, mobile, place, post_office, district, pincode
            ) VALUES (
                app_data->>(column_mapping->>'name'),
                app_data->>(column_mapping->>'designation'),
                app_data->>(column_mapping->>'subject_specification'),
                app_data->>(column_mapping->>'specify_other'),
                app_data->>(column_mapping->>'email'),
                app_data->>(column_mapping->>'mobile'),
                app_data->>(column_mapping->>'place'),
                app_data->>(column_mapping->>'post_office'),
                app_data->>(column_mapping->>'district'),
                app_data->>(column_mapping->>'pincode')
            );
            imported := imported + 1;
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            errors_arr := array_append(errors_arr, SQLERRM);
        END;
    END LOOP;
    
    RETURN QUERY SELECT imported, error_count, errors_arr;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION bulk_import_applications TO authenticated;

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT ON job_applications TO anon;
GRANT ALL PRIVILEGES ON job_applications TO authenticated;