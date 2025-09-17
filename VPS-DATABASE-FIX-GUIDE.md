# VPS Database Connection Fix Guide

## Problem Identified
The "failed to fetch" error during login occurs because the application is trying to connect to a local Supabase instance (`http://127.0.0.1:54323`) which doesn't exist on the VPS.

## Root Cause
- The `.env` file contains localhost URLs for Supabase
- Production environment variables are not properly configured
- The application needs to connect to a production database

## Solutions

### Option 1: Use Hosted Supabase (Recommended)

1. **Create a Supabase Project:**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **Update Environment Variables:**
   ```bash
   # In your .env file on VPS
   VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
   VITE_SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

3. **Import Your Database Schema:**
   - Export your local database schema
   - Import it to your Supabase project
   - Set up Row Level Security (RLS) policies

### Option 2: Self-hosted PostgreSQL on VPS

1. **Install PostgreSQL on VPS:**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

2. **Create Database and User:**
   ```sql
   CREATE DATABASE pottur_school_connect;
   CREATE USER pottur_user WITH PASSWORD 'your-secure-password';
   GRANT ALL PRIVILEGES ON DATABASE pottur_school_connect TO pottur_user;
   ```

3. **Install and Configure Supabase CLI:**
   ```bash
   npm install -g supabase
   supabase init
   supabase start
   ```

4. **Update Environment Variables:**
   ```bash
   VITE_SUPABASE_URL="https://your-vps-domain.com"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-self-hosted-anon-key"
   VITE_SUPABASE_SERVICE_ROLE_KEY="your-self-hosted-service-role-key"
   ```

## Step-by-Step Fix Instructions

### 1. Update Environment Configuration

```bash
# On your VPS, edit the .env file
nano .env

# Replace localhost URLs with production URLs
# Use the values from your Supabase dashboard
```

### 2. Test Database Connection

```bash
# Run the connection test script
node test-database-connection.js

# You should see:
# ✅ Database Connection: PASS
# ✅ Authentication: PASS
```

### 3. Rebuild and Deploy

```bash
# Clean build with new environment
npm run clean
npm run build:prod

# Restart your web server
sudo systemctl restart nginx
# or
sudo systemctl restart apache2
```

### 4. Verify Fix

1. Open your application in browser
2. Try to login
3. Check browser console for errors
4. Verify network requests are going to correct URLs

## Common Issues and Solutions

### Issue: CORS Errors
**Solution:** Add your domain to Supabase CORS settings
```
# In Supabase Dashboard > Settings > API
# Add your domain to allowed origins:
https://your-domain.com
```

### Issue: Invalid API Keys
**Solution:** Regenerate keys in Supabase dashboard
- Go to Settings > API
- Copy the correct anon and service_role keys

### Issue: Database Tables Missing
**Solution:** Import your schema
```bash
# Export from local
supabase db dump --local > schema.sql

# Import to production
psql -h your-host -U your-user -d your-db < schema.sql
```

### Issue: Authentication Not Working
**Solution:** Check auth settings
- Verify site URL in Supabase auth settings
- Check redirect URLs
- Ensure JWT secret is correct

## Environment Variables Checklist

- [ ] `VITE_SUPABASE_URL` - Points to production Supabase instance
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` - Valid anon key
- [ ] `VITE_SUPABASE_SERVICE_ROLE_KEY` - Valid service role key
- [ ] `VITE_APP_ENV` - Set to "production"
- [ ] `NODE_ENV` - Set to "production"

## Testing Commands

```bash
# Test database connection
node test-database-connection.js

# Test build process
npm run build:prod

# Check environment variables
echo $VITE_SUPABASE_URL

# Test API endpoints
curl -X GET "$VITE_SUPABASE_URL/rest/v1/profiles" \
  -H "apikey: $VITE_SUPABASE_PUBLISHABLE_KEY"
```

## Next Steps After Fix

1. **Set up monitoring** for database connections
2. **Configure backups** for your production database
3. **Set up SSL certificates** for secure connections
4. **Monitor application logs** for any remaining issues
5. **Test all application features** to ensure they work with production database

## Support

If you continue to experience issues:
1. Check the browser console for detailed error messages
2. Verify network connectivity to your Supabase instance
3. Test database connection using the provided test script
4. Check Supabase dashboard for any service issues

---

**Important:** Always backup your data before making changes to production databases