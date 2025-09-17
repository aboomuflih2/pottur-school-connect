# VPS Deployment Troubleshooting Guide

This guide helps diagnose and resolve common issues when deploying applications on a VPS.

## Quick Diagnostic Commands

Run these scripts first to gather information:

```bash
# Make scripts executable
chmod +x vps-*.sh

# Run diagnostic scripts
./vps-docker-diagnostic.sh
./vps-supabase-test.sh
./vps-connectivity-test.sh
./vps-env-check.sh
./vps-api-test.sh
./vps-logs-check.sh
```

## Common Issues and Solutions

### 1. Docker Container Issues

#### Problem: Containers not starting
**Symptoms:**
- `docker ps` shows no running containers
- Application not accessible
- "Connection refused" errors

**Solutions:**
```bash
# Check container status
docker ps -a

# Check container logs
docker logs <container_name>

# Restart containers
docker-compose down
docker-compose up -d

# Rebuild if needed
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Problem: Port conflicts
**Symptoms:**
- "Port already in use" errors
- Containers failing to start

**Solutions:**
```bash
# Check what's using the port
sudo netstat -tulpn | grep :3000
sudo lsof -i :3000

# Kill process using the port
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

#### Problem: Out of disk space
**Symptoms:**
- "No space left on device" errors
- Containers crashing

**Solutions:**
```bash
# Check disk usage
df -h

# Clean Docker resources
docker system prune -a
docker volume prune

# Remove unused images
docker image prune -a
```

### 2. Network and Connectivity Issues

#### Problem: Cannot access application from browser
**Symptoms:**
- Timeout errors
- "This site can't be reached"
- Connection refused

**Solutions:**
```bash
# Check if application is running locally
curl http://localhost:3000
curl http://127.0.0.1:3000

# Check firewall settings
sudo ufw status
sudo iptables -L

# Open required ports
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow 443

# Check if port is listening
sudo netstat -tulpn | grep :3000
```

#### Problem: CORS errors
**Symptoms:**
- Browser console shows CORS errors
- API calls failing from frontend

**Solutions:**
1. Update CORS configuration in your backend
2. Check Supabase CORS settings
3. Ensure proper origin headers

```javascript
// Example CORS fix for Express.js
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));
```

### 3. Environment Configuration Issues

#### Problem: Environment variables not loaded
**Symptoms:**
- "undefined" values in application
- Configuration errors
- Database connection failures

**Solutions:**
```bash
# Check if .env.vps exists and has correct values
cat .env.vps

# Verify environment variables are loaded in containers
docker exec <container_name> env | grep VITE_

# Restart containers after env changes
docker-compose down
docker-compose up -d
```

#### Problem: Supabase connection issues
**Symptoms:**
- Authentication failures
- Database connection errors
- "Invalid API key" errors

**Solutions:**
```bash
# Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" "YOUR_SUPABASE_URL/rest/v1/"

# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Verify keys in Supabase dashboard
# - Go to Settings > API
# - Copy fresh keys if needed
```

### 4. SSL/HTTPS Issues

#### Problem: SSL certificate errors
**Symptoms:**
- "Not secure" warnings
- Certificate errors
- Mixed content warnings

**Solutions:**
```bash
# Check certificate status
openssl s_client -connect yourdomain.com:443

# Renew Let's Encrypt certificate
sudo certbot renew

# Check nginx/apache configuration
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Database Issues

#### Problem: Database connection failures
**Symptoms:**
- "Connection refused" to database
- Timeout errors
- Authentication failures

**Solutions:**
```bash
# Check database container
docker ps | grep postgres
docker logs <postgres_container>

# Test database connection
psql -h localhost -U username -d database_name

# Check database configuration
cat docker-compose.yml | grep -A 10 postgres
```

### 6. Performance Issues

#### Problem: Slow application response
**Symptoms:**
- Long loading times
- Timeouts
- High CPU/memory usage

**Solutions:**
```bash
# Check system resources
top
htop
free -h
df -h

# Check container resources
docker stats

# Monitor logs for errors
tail -f /var/log/nginx/error.log
docker logs -f <container_name>
```

## Step-by-Step Debugging Process

### Phase 1: Initial Assessment
1. **Check if containers are running:**
   ```bash
   docker ps
   ```

2. **Test local connectivity:**
   ```bash
   curl http://localhost:3000
   ```

3. **Check system resources:**
   ```bash
   free -h
   df -h
   ```

### Phase 2: Deep Dive
1. **Examine container logs:**
   ```bash
   docker logs <container_name> --tail 50
   ```

2. **Check environment configuration:**
   ```bash
   ./vps-env-check.sh
   ```

3. **Test external connections:**
   ```bash
   ./vps-supabase-test.sh
   ./vps-api-test.sh
   ```

### Phase 3: Network Diagnostics
1. **Check port accessibility:**
   ```bash
   sudo netstat -tulpn | grep :3000
   ```

2. **Test firewall rules:**
   ```bash
   sudo ufw status
   ```

3. **Verify DNS resolution:**
   ```bash
   nslookup yourdomain.com
   ```

## Emergency Recovery Procedures

### Complete Application Reset
```bash
# Stop all containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Clean Docker system
docker system prune -a

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d
```

### Rollback to Previous Version
```bash
# If using Git
git log --oneline -10
git checkout <previous_commit_hash>
docker-compose down
docker-compose build
docker-compose up -d
```

### Database Recovery
```bash
# Backup current database
docker exec <postgres_container> pg_dump -U username database_name > backup.sql

# Restore from backup
docker exec -i <postgres_container> psql -U username database_name < backup.sql
```

## Monitoring and Maintenance

### Regular Health Checks
```bash
# Create a health check script
#!/bin/bash
echo "=== Health Check $(date) ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo "\nDisk Usage:"
df -h | grep -E '(Filesystem|/dev/)'
echo "\nMemory Usage:"
free -h
echo "\nLoad Average:"
uptime
```

### Log Rotation
```bash
# Configure Docker log rotation
sudo nano /etc/docker/daemon.json
```

Add:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Automated Backups
```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup database
docker exec postgres_container pg_dump -U username database_name > $BACKUP_DIR/database.sql

# Backup application files
tar -czf $BACKUP_DIR/app_files.tar.gz /path/to/app

# Clean old backups (keep 7 days)
find /backups -type d -mtime +7 -exec rm -rf {} +
```

## Common Error Messages and Solutions

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| "Connection refused" | Service not running | Check if containers are up |
| "Port already in use" | Port conflict | Kill process or change port |
| "No space left on device" | Disk full | Clean Docker resources |
| "Permission denied" | File permissions | Check file ownership/permissions |
| "Invalid API key" | Wrong Supabase key | Verify keys in dashboard |
| "CORS error" | Cross-origin issue | Update CORS configuration |
| "502 Bad Gateway" | Upstream server down | Check backend service |
| "SSL certificate error" | Certificate issue | Renew or reconfigure SSL |

## Getting Help

If issues persist:

1. **Gather diagnostic information:**
   ```bash
   # Run all diagnostic scripts
   ./vps-docker-diagnostic.sh > diagnostics.log
   ./vps-logs-check.sh >> diagnostics.log
   ```

2. **Check application-specific logs:**
   ```bash
   docker logs <app_container> --tail 100
   ```

3. **Document the issue:**
   - What were you trying to do?
   - What error messages did you see?
   - What diagnostic scripts showed?
   - What steps have you already tried?

4. **Contact support with:**
   - Diagnostic logs
   - Error messages
   - System information
   - Steps to reproduce

## Prevention Tips

1. **Regular monitoring:** Set up automated health checks
2. **Keep backups:** Automate database and file backups
3. **Update regularly:** Keep Docker images and system updated
4. **Monitor resources:** Watch disk space and memory usage
5. **Test changes:** Use staging environment before production
6. **Document changes:** Keep track of configuration modifications

---

**Remember:** Always test solutions in a staging environment first when possible!