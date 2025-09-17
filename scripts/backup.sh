#!/bin/bash

# Database backup script for Pottur School Connect
# This script creates automated backups of the PostgreSQL database

set -e

# Configuration
DB_NAME="pottur_school_connect"
DB_USER="pottur_user"
DB_HOST="postgres"
DB_PORT="5432"
BACKUP_DIR="/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/pottur_backup_${DATE}.sql"
RETENTION_DAYS=7

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
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

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to create database backup
create_backup() {
    log_info "Starting database backup..."
    
    # Check if database is accessible
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
        log_error "Database is not accessible. Backup failed."
        exit 1
    fi
    
    # Create backup
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose --clean --no-owner --no-privileges \
        --format=custom --compress=9 \
        --file="$BACKUP_FILE" 2>/dev/null; then
        
        log_info "Backup created successfully: $BACKUP_FILE"
        
        # Get backup file size
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log_info "Backup size: $BACKUP_SIZE"
        
    else
        log_error "Backup failed!"
        exit 1
    fi
}

# Function to clean old backups
clean_old_backups() {
    log_info "Cleaning old backups (older than $RETENTION_DAYS days)..."
    
    # Find and delete old backup files
    OLD_BACKUPS=$(find "$BACKUP_DIR" -name "pottur_backup_*.sql" -type f -mtime +$RETENTION_DAYS)
    
    if [ -n "$OLD_BACKUPS" ]; then
        echo "$OLD_BACKUPS" | while read -r backup_file; do
            log_info "Removing old backup: $(basename "$backup_file")"
            rm -f "$backup_file"
        done
    else
        log_info "No old backups to clean."
    fi
}

# Function to verify backup integrity
verify_backup() {
    log_info "Verifying backup integrity..."
    
    if pg_restore --list "$BACKUP_FILE" > /dev/null 2>&1; then
        log_info "Backup verification successful."
    else
        log_error "Backup verification failed!"
        exit 1
    fi
}

# Function to create schema-only backup
create_schema_backup() {
    SCHEMA_BACKUP_FILE="${BACKUP_DIR}/pottur_schema_${DATE}.sql"
    
    log_info "Creating schema-only backup..."
    
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --schema-only --verbose --clean --no-owner --no-privileges \
        --file="$SCHEMA_BACKUP_FILE" 2>/dev/null; then
        
        log_info "Schema backup created: $SCHEMA_BACKUP_FILE"
    else
        log_warn "Schema backup failed, but continuing..."
    fi
}

# Function to show backup statistics
show_backup_stats() {
    log_info "Backup Statistics:"
    echo "  Database: $DB_NAME"
    echo "  Host: $DB_HOST:$DB_PORT"
    echo "  User: $DB_USER"
    echo "  Backup File: $BACKUP_FILE"
    echo "  Date: $(date)"
    
    # Count total backups
    TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "pottur_backup_*.sql" -type f | wc -l)
    echo "  Total Backups: $TOTAL_BACKUPS"
    
    # Show disk usage
    TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
    echo "  Total Backup Size: $TOTAL_SIZE"
}

# Main execution
main() {
    log_info "Starting Pottur School Connect database backup process..."
    
    # Check if required environment variables are set
    if [ -z "$PGPASSWORD" ]; then
        log_error "PGPASSWORD environment variable is not set!"
        exit 1
    fi
    
    # Create backups
    create_backup
    verify_backup
    create_schema_backup
    clean_old_backups
    show_backup_stats
    
    log_info "Backup process completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    "backup")
        create_backup
        ;;
    "clean")
        clean_old_backups
        ;;
    "verify")
        if [ -n "$2" ]; then
            BACKUP_FILE="$2"
            verify_backup
        else
            log_error "Please provide backup file path for verification."
            exit 1
        fi
        ;;
    "stats")
        show_backup_stats
        ;;
    "")
        main
        ;;
    *)
        echo "Usage: $0 [backup|clean|verify <file>|stats]"
        echo "  backup - Create database backup only"
        echo "  clean  - Clean old backups only"
        echo "  verify - Verify specific backup file"
        echo "  stats  - Show backup statistics"
        echo "  (no args) - Run full backup process"
        exit 1
        ;;
esac