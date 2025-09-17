# Step-by-Step VPS Debugging Instructions

Follow these instructions on your VPS terminal to diagnose and fix deployment issues.

## Prerequisites

Ensure you have:
- SSH access to your VPS
- Root or sudo privileges
- The diagnostic scripts uploaded to your server

## Step 1: Initial Setup and File Preparation

### 1.1 Connect to your VPS
```bash
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
```

### 1.2 Navigate to your project directory
```bash
cd /path/to/your/project
# Common locations:
# cd /var/www/html/your-project
# cd /home/user/your-project
# cd /opt/your-project
```

### 1.3 Make diagnostic scripts executable
```bash
chmod +x vps-*.sh
ls -la vps-*.sh
```

Expected output:
```
-rwxr-xr-x 1 user user  xxxx vps-docker-diagnostic.sh
-rwxr-xr-x 1 user user  xxxx vps-supabase-test.sh
-rwxr-xr-x 1 user user  xxxx vps-connectivity-test.sh
-rwxr-xr-x 1 user user  xxxx vps-env-check.sh
-rwxr-xr-x 1 user user  xxxx vps-api-test.sh
-rwxr-xr-x 1 user user  xxxx vps-logs-check.sh
```

## Step 2: Quick System Health Check

### 2.1 Check system resources
```bash
echo "=== System Resources ==="
free -h
df -h
uptime
```

**What to look for:**
- Memory usage < 90%
- Disk usage < 85%
- Load average reasonable for your CPU count

### 2.2 Check if Docker is running
```bash
echo "=== Docker Status ==="
sudo systemctl status docker
docker --version
```

**Expected:** Docker service should be "active (running)"

## Step 3: Run Diagnostic Scripts

### 3.1 Docker Container Diagnostics
```bash
echo "=== Running Docker Diagnostics ==="
./vps-docker-diagnostic.sh
```

**Key things to check in output:**
- ✓ Docker service is running
- ✓ Containers are running (not exited)
- ✓ No "Out of memory" or "No space" errors

**If containers are not running:**
```bash
# Try to start them
docker-compose up -d

# Check logs if they fail
docker-compose logs
```

### 3.2 Environment Variables Check
```bash
echo "=== Running Environment Check ==="
./vps-env-check.sh
```

**Key things to check:**
- ✓ .env.vps file exists
- ✓ VITE_SUPABASE_URL is set
- ✓ VITE_SUPABASE_ANON_KEY is set
- ✓ No placeholder values (like "your-key-here")

**If environment variables are missing:**
```bash
# Edit the .env.vps file
nano .env.vps

# Add missing variables:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Restart containers after changes
docker-compose down
docker-compose up -d
```

### 3.3 Connectivity Test
```bash
echo "=== Running Connectivity Test ==="
./vps-connectivity-test.sh
```

**Key things to check:**
- ✓ Frontend accessible on expected port
- ✓ Backend accessible on expected port
- ✓ No firewall blocking connections

**If connectivity fails:**
```bash
# Check what's listening on ports
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :80

# Check firewall
sudo ufw status

# Open ports if needed
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow 443
```

### 3.4 Supabase Connection Test
```bash
echo "=== Running Supabase Test ==="
./vps-supabase-test.sh
```

**Key things to check:**
- ✓ Supabase URL is reachable
- ✓ API key is valid
- ✓ No network connectivity issues

**If Supabase connection fails:**
```bash
# Test manual connection
curl -H "apikey: YOUR_ANON_KEY" "YOUR_SUPABASE_URL/rest/v1/"

# Check DNS resolution
nslookup your-project.supabase.co

# Check if your VPS can reach external sites
curl -I https://google.com
```

### 3.5 API Endpoints Test
```bash
echo "=== Running API Test ==="
./vps-api-test.sh
```

**Key things to check:**
- ✓ Authentication endpoints respond
- ✓ CORS headers are present
- ✓ Response times are reasonable

### 3.6 Logs Analysis
```bash
echo "=== Running Logs Check ==="
./vps-logs-check.sh
```

**Key things to look for:**
- ✗ Error messages in application logs
- ✗ Database connection errors
- ✗ Memory or disk space warnings

## Step 4: Manual Verification

### 4.1 Test local application access
```bash
echo "=== Testing Local Access ==="

# Test if application responds locally
curl -I http://localhost:3000
curl -I http://127.0.0.1:3000

# Test specific endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/
```

**Expected:** HTTP 200 responses or appropriate status codes

### 4.2 Test external access (from another machine)
```bash
echo "=== Testing External Access ==="

# Get your VPS IP
curl ifconfig.me
echo

# Test if ports are open externally
# (Run this from your local machine, not VPS)
# curl -I http://YOUR_VPS_IP:3000
```

### 4.3 Check application logs in real-time
```bash
echo "=== Real-time Log Monitoring ==="

# Monitor Docker container logs
docker-compose logs -f --tail 20

# In another terminal, monitor system logs
sudo tail -f /var/log/syslog

# Monitor nginx logs (if using nginx)
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Step 5: Common Issue Resolution

### 5.1 If containers keep restarting
```bash
echo "=== Debugging Container Restarts ==="

# Check container exit codes
docker ps -a

# Check specific container logs
docker logs <container_name> --tail 50

# Check resource limits
docker stats

# Increase memory limits in docker-compose.yml if needed
```

### 5.2 If application is slow
```bash
echo "=== Performance Debugging ==="

# Check system load
top
htop  # if available

# Check disk I/O
iostat 1 5  # if available

# Check container resource usage
docker stats

# Check for swap usage
free -h
swapon -s
```

### 5.3 If database connections fail
```bash
echo "=== Database Connection Debugging ==="

# Check if database container is running
docker ps | grep postgres
docker ps | grep mysql

# Test database connection
# For PostgreSQL:
docker exec -it <postgres_container> psql -U username -d database_name

# For MySQL:
docker exec -it <mysql_container> mysql -u username -p database_name

# Check database logs
docker logs <database_container> --tail 50
```

## Step 6: Recovery Actions

### 6.1 Restart application (soft restart)
```bash
echo "=== Soft Restart ==="

# Restart containers
docker-compose restart

# Wait and check status
sleep 10
docker ps
```

### 6.2 Full application restart
```bash
echo "=== Full Restart ==="

# Stop all containers
docker-compose down

# Start containers
docker-compose up -d

# Monitor startup
docker-compose logs -f
```

### 6.3 Rebuild application (if code changes)
```bash
echo "=== Rebuild Application ==="

# Pull latest code (if using git)
git pull origin main

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Monitor startup
docker-compose logs -f
```

### 6.4 Emergency cleanup (if disk space issues)
```bash
echo "=== Emergency Cleanup ==="

# Clean Docker resources
docker system prune -a
docker volume prune

# Clean system logs
sudo journalctl --vacuum-time=7d

# Clean package cache
sudo apt clean  # Ubuntu/Debian
sudo yum clean all  # CentOS/RHEL

# Check disk space after cleanup
df -h
```

## Step 7: Verification and Testing

### 7.1 Verify application is working
```bash
echo "=== Final Verification ==="

# Check all containers are running
docker ps

# Test local access
curl -I http://localhost:3000

# Test API endpoints
curl http://localhost:3000/api/health

# Check logs for errors
docker-compose logs --tail 20
```

### 7.2 Test from browser
1. Open browser
2. Navigate to `http://YOUR_VPS_IP:3000`
3. Check browser console for errors (F12)
4. Test key functionality (login, navigation, etc.)

### 7.3 Performance verification
```bash
echo "=== Performance Check ==="

# Check response times
time curl -s http://localhost:3000 > /dev/null

# Check system resources after startup
free -h
df -h
uptime
```

## Step 8: Documentation and Monitoring

### 8.1 Save diagnostic results
```bash
echo "=== Saving Diagnostics ==="

# Create diagnostics report
echo "Diagnostics Report - $(date)" > diagnostics-$(date +%Y%m%d-%H%M).log
echo "================================" >> diagnostics-$(date +%Y%m%d-%H%M).log

# Run all diagnostics and save
./vps-docker-diagnostic.sh >> diagnostics-$(date +%Y%m%d-%H%M).log
./vps-env-check.sh >> diagnostics-$(date +%Y%m%d-%H%M).log
./vps-connectivity-test.sh >> diagnostics-$(date +%Y%m%d-%H%M).log

echo "Diagnostics saved to diagnostics-$(date +%Y%m%d-%H%M).log"
```

### 8.2 Set up monitoring (optional)
```bash
echo "=== Setting up Basic Monitoring ==="

# Create a simple health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
echo "Health Check - $(date)"
echo "Containers: $(docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -c Up)"
echo "Memory: $(free -h | grep Mem | awk '{print $3"/"$2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $5}')"
echo "Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "---"
EOF

chmod +x health-check.sh

# Run health check
./health-check.sh
```

## Troubleshooting Quick Reference

| Issue | Quick Command | Expected Result |
|-------|---------------|----------------|
| Containers not running | `docker ps` | Should show running containers |
| High memory usage | `free -h` | Available memory > 10% |
| Disk space full | `df -h` | Usage < 85% |
| Port not accessible | `netstat -tulpn \| grep :3000` | Should show listening port |
| Firewall blocking | `ufw status` | Should show allowed ports |
| Application errors | `docker logs <container>` | Check for error messages |
| Slow performance | `top` | Check CPU/memory usage |
| Database issues | `docker ps \| grep postgres` | Database container running |

## Getting Help

If issues persist after following these steps:

1. **Gather information:**
   ```bash
   # Create comprehensive report
   ./vps-docker-diagnostic.sh > issue-report.log
   ./vps-logs-check.sh >> issue-report.log
   docker ps -a >> issue-report.log
   docker-compose logs >> issue-report.log
   ```

2. **Include in your support request:**
   - The issue-report.log file
   - What you were trying to do
   - What error messages you saw
   - What steps you've already tried
   - Your VPS specifications (CPU, RAM, disk)

3. **Emergency contacts:**
   - System administrator
   - Development team
   - VPS provider support

---

**Remember:** Always backup your data before making significant changes!