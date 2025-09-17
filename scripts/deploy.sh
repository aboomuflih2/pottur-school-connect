#!/bin/bash

# VPS Deployment Script for Pottur School Connect
# This script automates the deployment process on a VPS server

set -e

# Configuration
APP_NAME="pottur-school-connect"
APP_DIR="/var/www/$APP_NAME"
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.production"
BACKUP_DIR="/var/backups/$APP_NAME"
LOG_DIR="/var/log/$APP_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log_info() {
    log "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    log "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    log "${RED}[ERROR]${NC} $1"
}

log_step() {
    log "${BLUE}[STEP]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Function to check system requirements
check_requirements() {
    log_step "Checking system requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check available disk space (minimum 5GB)
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
    REQUIRED_SPACE=5242880  # 5GB in KB
    
    if [ "$AVAILABLE_SPACE" -lt "$REQUIRED_SPACE" ]; then
        log_error "Insufficient disk space. At least 5GB required."
        exit 1
    fi
    
    log_info "System requirements check passed."
}

# Function to install system dependencies
install_dependencies() {
    log_step "Installing system dependencies..."
    
    # Update package list
    apt-get update -qq
    
    # Install required packages
    apt-get install -y \
        curl \
        wget \
        git \
        nginx \
        certbot \
        python3-certbot-nginx \
        ufw \
        fail2ban \
        htop \
        unzip
    
    log_info "System dependencies installed successfully."
}

# Function to setup firewall
setup_firewall() {
    log_step "Configuring firewall..."
    
    # Reset UFW to defaults
    ufw --force reset
    
    # Set default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow PostgreSQL (only from localhost)
    ufw allow from 127.0.0.1 to any port 5432
    
    # Enable firewall
    ufw --force enable
    
    log_info "Firewall configured successfully."
}

# Function to create application directories
setup_directories() {
    log_step "Setting up application directories..."
    
    # Create main application directory
    mkdir -p "$APP_DIR"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Create log directory
    mkdir -p "$LOG_DIR"
    
    # Create uploads directory
    mkdir -p "/var/www/pottur-school/uploads"
    
    # Set proper permissions
    chown -R www-data:www-data "/var/www/pottur-school"
    chmod -R 755 "/var/www/pottur-school"
    
    log_info "Application directories created successfully."
}

# Function to setup environment file
setup_environment() {
    log_step "Setting up environment configuration..."
    
    if [ ! -f "$APP_DIR/$ENV_FILE" ]; then
        log_warn "Environment file not found. Creating template..."
        
        # Copy environment template
        cp ".env.production" "$APP_DIR/$ENV_FILE"
        
        log_warn "Please edit $APP_DIR/$ENV_FILE with your actual configuration values."
        log_warn "Deployment will pause here. Press Enter after editing the file."
        read -p "Press Enter to continue..."
    fi
    
    # Validate environment file
    if ! grep -q "VITE_SUPABASE_URL" "$APP_DIR/$ENV_FILE"; then
        log_error "Environment file is missing required variables."
        exit 1
    fi
    
    log_info "Environment configuration validated."
}

# Function to deploy application
deploy_application() {
    log_step "Deploying application..."
    
    # Copy application files
    cp -r . "$APP_DIR/"
    
    # Set proper ownership
    chown -R www-data:www-data "$APP_DIR"
    
    # Navigate to application directory
    cd "$APP_DIR"
    
    # Pull latest images
    docker-compose pull
    
    # Build and start services
    docker-compose up -d --build
    
    # Wait for services to be ready
    log_info "Waiting for services to start..."
    sleep 30
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        log_info "Application deployed successfully."
    else
        log_error "Some services failed to start. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Function to setup SSL certificate
setup_ssl() {
    local domain="$1"
    
    if [ -n "$domain" ]; then
        log_step "Setting up SSL certificate for $domain..."
        
        # Obtain SSL certificate
        certbot --nginx -d "$domain" --non-interactive --agree-tos --email "admin@$domain"
        
        # Setup auto-renewal
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        log_info "SSL certificate configured successfully."
    else
        log_warn "No domain provided. Skipping SSL setup."
    fi
}

# Function to setup monitoring
setup_monitoring() {
    log_step "Setting up monitoring..."
    
    # Create monitoring script
    cat > "/usr/local/bin/pottur-monitor.sh" << 'EOF'
#!/bin/bash
# Simple monitoring script for Pottur School Connect

APP_DIR="/var/www/pottur-school-connect"
LOG_FILE="/var/log/pottur-school-connect/monitor.log"

cd "$APP_DIR"

# Check if services are running
if ! docker-compose ps | grep -q "Up"; then
    echo "$(date): Services are down. Attempting restart..." >> "$LOG_FILE"
    docker-compose up -d
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "$(date): Disk usage is high: ${DISK_USAGE}%" >> "$LOG_FILE"
fi
EOF

    chmod +x "/usr/local/bin/pottur-monitor.sh"
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/pottur-monitor.sh") | crontab -
    
    log_info "Monitoring setup completed."
}

# Function to show deployment summary
show_summary() {
    log_step "Deployment Summary"
    
    echo "Application: $APP_NAME"
    echo "Directory: $APP_DIR"
    echo "Status: $(docker-compose ps --services | wc -l) services deployed"
    echo "URL: http://$(hostname -I | awk '{print $1}')"
    echo ""
    echo "Useful commands:"
    echo "  View logs: cd $APP_DIR && docker-compose logs -f"
    echo "  Restart: cd $APP_DIR && docker-compose restart"
    echo "  Stop: cd $APP_DIR && docker-compose down"
    echo "  Backup: cd $APP_DIR && ./scripts/backup.sh"
    echo ""
    echo "Configuration files:"
    echo "  Environment: $APP_DIR/$ENV_FILE"
    echo "  Docker Compose: $APP_DIR/$DOCKER_COMPOSE_FILE"
    echo "  Logs: $LOG_DIR"
    echo "  Backups: $BACKUP_DIR"
}

# Main deployment function
main() {
    local domain="$1"
    
    log_info "Starting Pottur School Connect VPS deployment..."
    
    check_root
    check_requirements
    install_dependencies
    setup_firewall
    setup_directories
    setup_environment
    deploy_application
    setup_ssl "$domain"
    setup_monitoring
    show_summary
    
    log_info "Deployment completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    "install")
        main "$2"
        ;;
    "update")
        log_step "Updating application..."
        cd "$APP_DIR"
        docker-compose pull
        docker-compose up -d --build
        log_info "Application updated successfully."
        ;;
    "restart")
        log_step "Restarting application..."
        cd "$APP_DIR"
        docker-compose restart
        log_info "Application restarted successfully."
        ;;
    "stop")
        log_step "Stopping application..."
        cd "$APP_DIR"
        docker-compose down
        log_info "Application stopped successfully."
        ;;
    "logs")
        cd "$APP_DIR"
        docker-compose logs -f
        ;;
    "status")
        cd "$APP_DIR"
        docker-compose ps
        ;;
    *)
        echo "Usage: $0 [install <domain>|update|restart|stop|logs|status]"
        echo "  install <domain> - Full installation with optional domain for SSL"
        echo "  update           - Update application to latest version"
        echo "  restart          - Restart all services"
        echo "  stop             - Stop all services"
        echo "  logs             - View application logs"
        echo "  status           - Show service status"
        exit