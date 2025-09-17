# Self-Hosted Supabase Configuration Guide

This guide will help you connect your frontend application to a self-hosted Supabase instance running on your VPS.

## Prerequisites

- Self-hosted Supabase instance running on your VPS
- VPS with Docker and Docker Compose installed
- Domain name or static IP address for your VPS

## Default Supabase Self-Hosted Ports

- **API Gateway**: Port 8000 (Kong)
- **Studio**: Port 3000 (Supabase Studio)
- **Database**: Port 5432 (PostgreSQL)
- **Auth**: Port 9999 (GoTrue)
- **Storage**: Port 8080 (Storage API)
- **Realtime**: Port 4000 (Realtime)

## Step 1: Get Your Supabase Configuration

### 1.1 Access Supabase Studio

Open your browser and navigate to:
```
http://YOUR_VPS_IP:3000
```

### 1.2 Get API Keys

1. In Supabase Studio, go to **Settings** → **API**
2. Copy the following keys:
   - **URL**: `http://YOUR_VPS_IP:8000`
   - **anon public key**: This is your publishable key
   - **service_role key**: This is your service role key (keep secret)

## Step 2: Configure Environment Variables

### 2.1 Update .env.production

Replace the placeholders in your `.env.production` file:

```bash
# Self-hosted Supabase Configuration
VITE_SUPABASE_URL="http://YOUR_VPS_IP:8000"
VITE_SUPABASE_PUBLISHABLE_KEY="your-actual-anon-key"
VITE_SUPABASE_SERVICE_ROLE_KEY="your-actual-service-role-key"
VITE_SUPABASE_STUDIO_URL="http://YOUR_VPS_IP:3000"
```

### 2.2 For Domain-Based Setup

If you have a domain name pointing to your VPS:

```bash
# Domain-based configuration
VITE_SUPABASE_URL="https://your-domain.com:8000"
VITE_SUPABASE_PUBLISHABLE_KEY="your-actual-anon-key"
VITE_SUPABASE_SERVICE_ROLE_KEY="your-actual-service-role-key"
VITE_SUPABASE_STUDIO_URL="https://your-domain.com:3000"
```

## Step 3: CORS Configuration

### 3.1 Update Supabase CORS Settings

In your Supabase self-hosted configuration, update the CORS settings to allow your frontend domain:

1. Edit your `docker-compose.yml` or Supabase configuration
2. Add your frontend domain to the allowed origins:

```yaml
environment:
  CORS_ALLOWED_ORIGINS: "http://localhost:3000,https://your-frontend-domain.com"
```

### 3.2 Kong Configuration (API Gateway)

If you need to modify Kong settings, update the Kong configuration to allow CORS:

```yaml
services:
  kong:
    environment:
      KONG_PLUGINS: "cors,key-auth,acl"
```

## Step 4: SSL/TLS Configuration (Recommended)

### 4.1 Using Nginx Reverse Proxy

Create an Nginx configuration to proxy requests with SSL:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Supabase API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Supabase Studio
    location /studio/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4.2 Update Environment for SSL

```bash
VITE_SUPABASE_URL="https://your-domain.com/api"
VITE_SUPABASE_STUDIO_URL="https://your-domain.com/studio"
```

## Step 5: Database Migration

### 5.1 Apply Existing Migrations

If you have existing migrations, apply them to your self-hosted instance:

```bash
# Connect to your self-hosted Supabase
supabase db reset --db-url "postgresql://postgres:your-password@YOUR_VPS_IP:5432/postgres"

# Apply migrations
supabase db push --db-url "postgresql://postgres:your-password@YOUR_VPS_IP:5432/postgres"
```

### 5.2 Manual Migration

Alternatively, run the migration scripts directly:

```bash
node apply-migrations.js
```

## Step 6: Testing Connection

### 6.1 Test API Connection

Create a test script to verify the connection:

```javascript
// test-self-hosted-connection.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://YOUR_VPS_IP:8000'
const supabaseKey = 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count')
    if (error) throw error
    console.log('✅ Connection successful!')
    console.log('Data:', data)
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
  }
}

testConnection()
```

### 6.2 Run the Test

```bash
node test-self-hosted-connection.js
```

## Step 7: Firewall Configuration

### 7.1 Open Required Ports

Ensure your VPS firewall allows the necessary ports:

```bash
# Ubuntu/Debian with ufw
sudo ufw allow 8000  # Supabase API
sudo ufw allow 3000  # Supabase Studio
sudo ufw allow 5432  # PostgreSQL (if direct access needed)

# CentOS/RHEL with firewalld
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --reload
```

## Step 8: Security Considerations

### 8.1 Network Security

- Use SSL/TLS certificates for production
- Restrict database access to localhost only
- Use strong passwords for all services
- Consider using a VPN for admin access

### 8.2 API Key Security

- Never expose service role keys in frontend code
- Use environment variables for all sensitive data
- Rotate keys regularly
- Monitor API usage

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if Supabase services are running
   - Verify firewall settings
   - Confirm correct IP address and ports

2. **CORS Errors**
   - Update CORS configuration in Supabase
   - Check Kong gateway settings
   - Verify frontend domain in allowed origins

3. **Authentication Errors**
   - Verify API keys are correct
   - Check if keys have proper permissions
   - Ensure anon key is used for frontend

4. **SSL Certificate Issues**
   - Verify certificate paths
   - Check certificate validity
   - Ensure proper Nginx configuration

### Logs and Debugging

```bash
# Check Supabase logs
docker-compose logs -f

# Check specific service logs
docker-compose logs kong
docker-compose logs auth
docker-compose logs db
```

## Next Steps

1. Set up automated backups for your database
2. Configure monitoring and alerting
3. Set up CI/CD pipeline for deployments
4. Implement proper logging and error tracking

## Support

For additional help:
- Check Supabase self-hosting documentation
- Review Docker Compose logs
- Verify network connectivity
- Test with curl commands

---

**Note**: Replace `YOUR_VPS_IP` with your actual VPS IP address and update all placeholder values with your actual configuration.