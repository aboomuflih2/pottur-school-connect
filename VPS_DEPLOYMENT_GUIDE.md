# Pottur School Connect - VPS Deployment Guide

This comprehensive guide will help you deploy the Pottur School Connect application on your VPS server with PostgreSQL database.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Preparation](#server-preparation)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [SSL Configuration](#ssl-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Backup and Recovery](#backup-and-recovery)

## Prerequisites

### Server Requirements

- **Operating System**: Ubuntu 20.04 LTS or newer (recommended)
- **RAM**: Minimum 2GB, recommended 4GB+
- **Storage**: Minimum 20GB SSD
- **CPU**: 2 cores minimum
- **Network**: Public IP address
- **Domain**: Optional but recommended for SSL

### Required Software

- Docker 20.10+
- Docker Compose 2.0+
- Git
- Nginx
- Certbot (for SSL)

## Server Preparation

### 1. Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git nginx ufw fail2ban htop unzip

# Create a non-root user (if not already done)
sudo adduser pottur
sudo usermod -aG sudo pottur
sudo usermod -aG docker pottur
```

### 2. Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### 3. Configure Firewall

```bash
# Reset and configure UFW
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow essential ports
sudo ufw allow ssh
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Enable firewall
sudo ufw --force enable
sudo ufw status
```

## Database Setup

### Option 1: Using Docker PostgreSQL (Recommended)

The application includes a Docker Compose configuration with PostgreSQL. This is the easiest option.

### Option 2: Standalone PostgreSQL Installation

If you prefer to install PostgreSQL directly on the server:

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE pottur_school_connect;
CREATE USER pottur_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE pottur_school_connect TO pottur_user;
\q
EOF
```

## Application Deployment

### 1. Clone the Repository

```bash
# Switch to pottur user
su - pottur

# Clone the repository
git clone <your-repository-url> /var/www/pottur-school-connect
cd /var/www/pottur-school-connect
```

### 2. Configure Environment Variables

```bash
# Copy and edit the production environment file
cp .env.production .env
nano .env
```

**Important Environment Variables to Configure:**

```env
# Application Environment
VITE_APP_ENV="production"
NODE_ENV="production"

# Database Configuration
DATABASE_URL="postgresql://pottur_user:your-secure-password@postgres:5432/pottur_school_connect"
DATABASE_PASSWORD="your-secure-password"

# Security
JWT_SECRET="your-jwt-secret-key-here"
SESSION_SECRET="your-session-secret-here"

# Domain Configuration
VITE_APP_DOMAIN="https://your-domain.com"
VITE_API_BASE_URL="https://your-domain.com/api"

# Supabase Configuration (if using Supabase)
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-production-anon-key"
VITE_SUPABASE_SERVICE_ROLE_KEY="your-production-service-role-key"
```

### 3. Deploy Using Automated Script

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run deployment (replace your-domain.com with your actual domain)
sudo ./scripts/deploy.sh install your-domain.com
```

### 4. Manual Deployment Steps

If you prefer manual deployment:

```bash
# Build and start services
docker-compose up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Initialize Database

```bash
# Apply database migrations
docker-compose exec postgres psql -U pottur_user -d pottur_school_connect -f /migrations/apply-migrations.sql

# Or if using standalone PostgreSQL
psql -U pottur_user -d pottur_school_connect -f database/scripts/apply-migrations.sql
```

## SSL Configuration

### Using Certbot with Nginx

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Setup auto-renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual Nginx Configuration

Create `/etc/nginx/sites-available/pottur-school-connect`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/pottur-school-connect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Monitoring and Maintenance

### 1. Health Checks

```bash
# Check application status
cd /var/www/pottur-school-connect
docker-compose ps

# View logs
docker-compose logs -f

# Check resource usage
docker stats
```

### 2. Automated Monitoring

The deployment script sets up basic monitoring. You can enhance it:

```bash
# View monitoring logs
tail -f /var/log/pottur-school-connect/monitor.log

# Manual health check
curl -f http://localhost/health
```

### 3. Log Management

```bash
# Application logs
docker-compose logs --tail=100 frontend
docker-compose logs --tail=100 api
docker-compose logs --tail=100 postgres

# System logs
sudo journalctl -u docker -f
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Backup and Recovery

### 1. Database Backup

```bash
# Manual backup
cd /var/www/pottur-school-connect
./scripts/backup.sh

# Automated backup (daily at 2 AM)
sudo crontab -e
# Add this line:
0 2 * * * cd /var/www/pottur-school-connect && ./scripts/backup.sh
```

### 2. Application Backup

```bash
# Backup application files
tar -czf /var/backups/pottur-app-$(date +%Y%m%d).tar.gz /var/www/pottur-school-connect

# Backup uploads
tar -czf /var/backups/pottur-uploads-$(date +%Y%m%d).tar.gz /var/www/pottur-school/uploads
```

### 3. Recovery

```bash
# Restore database from backup
docker-compose exec postgres pg_restore -U pottur_user -d pottur_school_connect /backups/pottur_backup_YYYYMMDD_HHMMSS.sql

# Restore application files
tar -xzf /var/backups/pottur-app-YYYYMMDD.tar.gz -C /
```

## Troubleshooting

### Common Issues

#### 1. Services Won't Start

```bash
# Check Docker daemon
sudo systemctl status docker

# Check logs
docker-compose logs

# Restart services
docker-compose down
docker-compose up -d
```

#### 2. Database Connection Issues

```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U pottur_user

# Check environment variables
docker-compose exec api env | grep DATABASE

# Reset database
docker-compose down
docker volume rm pottur-school-connect_postgres_data
docker-compose up -d
```

#### 3. Permission Issues

```bash
# Fix file permissions
sudo chown -R www-data:www-data /var/www/pottur-school
sudo chmod -R 755 /var/www/pottur-school

# Fix upload directory
sudo mkdir -p /var/www/pottur-school/uploads
sudo chown -R www-data:www-data /var/www/pottur-school/uploads
```

#### 4. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run

# Check Nginx configuration
sudo nginx -t
```

### Performance Optimization

#### 1. Database Optimization

```sql
-- Connect to database
psql -U pottur_user -d pottur_school_connect

-- Analyze database
ANALYZE;

-- Check slow queries
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

#### 2. Application Optimization

```bash
# Monitor resource usage
docker stats

# Optimize Docker images
docker system prune -a

# Update to latest versions
docker-compose pull
docker-compose up -d
```

## Security Best Practices

### 1. Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d
```

### 2. Security Hardening

```bash
# Configure fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check firewall status
sudo ufw status verbose

# Monitor failed login attempts
sudo tail -f /var/log/auth.log
```

### 3. Regular Security Audits

```bash
# Check for security updates
sudo apt list --upgradable | grep security

# Scan for vulnerabilities
sudo apt install -y lynis
sudo lynis audit system
```

## Useful Commands

### Application Management

```bash
# Start application
cd /var/www/pottur-school-connect
docker-compose up -d

# Stop application
docker-compose down

# Restart application
docker-compose restart

# Update application
git pull
docker-compose up -d --build

# View logs
docker-compose logs -f

# Access database
docker-compose exec postgres psql -U pottur_user -d pottur_school_connect
```

### System Monitoring

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check network connections
ss -tulpn

# Check Docker resources
docker system df
```

## Support and Maintenance

For ongoing support and maintenance:

1. **Regular Backups**: Ensure daily automated backups are running
2. **Security Updates**: Apply security updates monthly
3. **Performance Monitoring**: Monitor resource usage weekly
4. **Log Review**: Review application and system logs weekly
5. **SSL Certificate Renewal**: Automated via Certbot

## Conclusion

Your Pottur School Connect application should now be successfully deployed on your VPS. The application will be accessible via your domain name with SSL encryption.

For any issues or questions, refer to the troubleshooting section or check the application logs for detailed error information.