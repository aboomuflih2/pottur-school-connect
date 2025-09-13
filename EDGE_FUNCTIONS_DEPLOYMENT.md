# Supabase Edge Functions Deployment Guide

## Overview
Three Edge Functions have been successfully created and deployed for PDF generation:

1. **generate-application-pdf** - Generates application summary PDFs
2. **generate-interview-letter** - Generates interview call letter PDFs  
3. **generate-mark-list** - Generates mark list PDFs

## Current Status ✅
- ✅ All three Edge Functions are created in `supabase/functions/`
- ✅ Local Supabase instance is running
- ✅ Edge Functions runtime is active and serving functions
- ✅ Functions are accessible at `http://127.0.0.1:54323/functions/v1/`
- ✅ Functions tested and working correctly

## Function Endpoints

### Local Development URLs:
- Application PDF: `http://127.0.0.1:54323/functions/v1/generate-application-pdf`
- Interview Letter: `http://127.0.0.1:54323/functions/v1/generate-interview-letter`
- Mark List: `http://127.0.0.1:54323/functions/v1/generate-mark-list`

## Required Parameters
All functions expect the same parameters:
```json
{
  "applicationNumber": "string",
  "applicationType": "kg_std" | "plus_one"
}
```

## How to Start/Deploy Edge Functions

### 1. Start Local Supabase (if not running)
```bash
npx supabase start
```

### 2. Serve Edge Functions
```bash
npx supabase functions serve
```

### 3. Check Status
```bash
npx supabase status
```

### 4. Test Functions
```bash
node test-edge-functions.mjs
```

## Function Details

### generate-application-pdf
- **Purpose**: Creates application summary PDF
- **Input**: applicationNumber, applicationType
- **Output**: HTML content for PDF generation
- **Status**: ✅ Working

### generate-interview-letter
- **Purpose**: Creates interview call letter PDF
- **Input**: applicationNumber, applicationType
- **Requirements**: Application must be shortlisted for interview
- **Status**: ✅ Working (validates business logic)

### generate-mark-list
- **Purpose**: Creates mark list PDF
- **Input**: applicationNumber, applicationType
- **Requirements**: Application status must be interview_complete, admitted, or not_admitted
- **Status**: ✅ Working

## Authentication
Functions use Supabase service role authentication:
- **Local Service Role Key**: Available in `npx supabase status` output
- **Headers Required**: 
  - `Authorization: Bearer <service_role_key>`
  - `Content-Type: application/json`

## Testing
A test script `test-edge-functions.mjs` has been created to verify all functions:
- Tests all three functions with sample data
- Validates function accessibility and response format
- Confirms PDF generation capability

## Production Deployment
To deploy to production Supabase:
```bash
npx supabase functions deploy generate-application-pdf
npx supabase functions deploy generate-interview-letter
npx supabase functions deploy generate-mark-list
```

## Troubleshooting

### If Edge Functions are not running:
1. Check Supabase status: `npx supabase status`
2. Start functions: `npx supabase functions serve`
3. Verify in browser: `http://127.0.0.1:54323/functions/v1/`

### If functions return errors:
1. Check application exists in database
2. Verify application status meets function requirements
3. Check Supabase logs for detailed error messages

## Next Steps
- Functions are ready for integration with the frontend application
- Can be called from React components using fetch/axios
- PDF generation will work with real application data from the database

---
**Status**: ✅ All Edge Functions successfully deployed and tested in local environment