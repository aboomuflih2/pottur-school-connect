# Self-Hosted Supabase Setup Guide for VPS

**VPS IP: 63.250.52.6**

This guide will help you configure your frontend application to connect to your self-hosted Supabase instance running on your VPS.

## 🚀 Quick Start

### 1. Get Your Supabase API Keys

First, you need to obtain the API keys from your self-hosted Supabase instance:

1. **Access Supabase Studio:**
   ```
   http://63.250.52.6:3000
   ```

2. **Navigate to API Settings:**
   - Go to `Settings` → `API`
   - Copy the following keys:
     - **anon public key** (for `VITE_SUPABASE_PUBLISHABLE_KEY`)
     - **service_role key** (for `VITE_SUPABASE_SERVICE_ROLE_KEY`)

### 2. Update Environment Variables

Update your `.env.production` file with the actual API keys:

```env
# Self-hosted Supabase Configuration on VPS
# VPS IP: 63.250.52.6
VITE_SUPABASE_URL="http://63.250.52.6:8000"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Your actual anon key
VITE_SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Your actual service role key

# Supabase Studio URL (for admin access)
VITE_SUPABASE_STUDIO_URL="http://63.250.52.6:3000"
```

### 3. Test the Connection

Run the connection test script:

```bash
node test-self-hosted-connection.js
```

## 🔧 Detailed Configuration

### VPS Requirements

Ensure your VPS has the following services running:

- **Supabase API**: Port 8000
- **Supabase Studio**: Port 3000
- **PostgreSQL**: Port 5432 (internal)

### Firewall Configuration

Make sure these ports are accessible from your development machine:

```bash
# Ubuntu/Debian firewall commands
sudo ufw allow 8000  # Supabase API
sudo ufw allow 3000  # Supabase Studio
sudo ufw status      # Check current rules
```

### Network Connectivity Test

Test if your VPS is accessible:

```bash
# Test API endpoint
curl http://63.250.52.6:8000/health

# Test Studio access
curl http://63.250.52.6:3000
```

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. "fetch failed" Error

**Symptoms:**
```
❌ Health check failed: TypeError: fetch failed
```

**Solutions:**
- Check if VPS is running and accessible
- Verify Supabase is running on port 8000
- Test network connectivity: `ping 63.250.52.6`
- Check firewall settings on VPS

#### 2. "Invalid API Key" Error

**Symptoms:**
```
❌ Health check failed: Invalid API key
```

**Solutions:**
- Verify API keys are correctly copied from Supabase Studio
- Ensure no extra spaces or characters in the keys
- Check that the anon key is being used (not service role for frontend)

#### 3. "Connection Refused" Error

**Symptoms:**
```
❌ Connection error: connect ECONNREFUSED
```

**Solutions:**
- Verify Supabase services are running on VPS
- Check if ports 8000 and 3000 are open
- Restart Supabase services if needed

#### 4. CORS Issues

**Symptoms:**
```
❌ CORS policy error
```

**Solutions:**
- Configure CORS in your Supabase instance
- Add your frontend domain to allowed origins
- For development, allow `http://localhost:*`

### VPS Service Status Check

SSH into your VPS and check Supabase status:

```bash
# Check if Supabase is running
sudo docker ps | grep supabase

# Check port usage
sudo netstat -tlnp | grep -E ':(3000|8000)'

# Restart Supabase if needed
sudo docker-compose restart
```

## 🔐 Security Considerations

### 1. API Key Security

- **Never commit real API keys to version control**
- Use environment variables for all sensitive data
- Rotate keys regularly
- Use service role key only on backend/server-side code

### 2. Network Security

- Consider using HTTPS with SSL certificates
- Implement proper firewall rules
- Use VPN or IP whitelisting for admin access

### 3. Database Security

- Enable Row Level Security (RLS) on all tables
- Configure proper user roles and permissions
- Regular database backups

## 📋 Deployment Checklist

- [ ] VPS is accessible at 63.250.52.6
- [ ] Supabase is running on ports 8000 (API) and 3000 (Studio)
- [ ] Firewall allows connections to required ports
- [ ] API keys obtained from Supabase Studio
- [ ] Environment variables updated with real keys
- [ ] Connection test passes
- [ ] Database migrations applied
- [ ] RLS policies configured
- [ ] CORS settings configured

## 🚀 Next Steps

1. **Test the connection** using the provided script
2. **Deploy your frontend** with the updated configuration
3. **Monitor the application** for any connection issues
4. **Set up SSL certificates** for production use
5. **Configure domain name** if not using IP directly

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all configuration steps
3. Test network connectivity
4. Check VPS logs for errors

---

**Configuration Summary:**
- VPS IP: `63.250.52.6`
- Supabase API: `http://63.250.52.6:8000`
- Supabase Studio: `http://63.250.52.6:3000`
- Test Script: `node test-self-hosted-connection.js`