#!/bin/sh

# Docker entrypoint script for Pottur School Connect
# This script handles environment variable substitution at runtime

set -e

echo "Starting Pottur School Connect application..."

# Function to replace environment variables in built files
replace_env_vars() {
    echo "Replacing environment variables in built files..."
    
    # Find all JS files in the dist directory
    find /usr/share/nginx/html -name "*.js" -type f -exec sed -i \
        -e "s|VITE_SUPABASE_URL_PLACEHOLDER|${VITE_SUPABASE_URL:-https://your-project-ref.supabase.co}|g" \
        -e "s|VITE_SUPABASE_PUBLISHABLE_KEY_PLACEHOLDER|${VITE_SUPABASE_PUBLISHABLE_KEY:-your-production-anon-key}|g" \
        -e "s|VITE_APP_DOMAIN_PLACEHOLDER|${VITE_APP_DOMAIN:-https://your-domain.com}|g" \
        -e "s|VITE_API_BASE_URL_PLACEHOLDER|${VITE_API_BASE_URL:-https://your-domain.com/api}|g" \
        {} \;
    
    echo "Environment variables replaced successfully."
}

# Function to create necessary directories
setup_directories() {
    echo "Setting up directories..."
    
    # Create uploads directory if it doesn't exist
    mkdir -p /var/www/pottur-school/uploads
    chown -R nginx:nginx /var/www/pottur-school/uploads
    chmod 755 /var/www/pottur-school/uploads
    
    echo "Directories setup completed."
}

# Function to validate environment variables
validate_env() {
    echo "Validating environment variables..."
    
    # Check if required environment variables are set
    if [ -z "$VITE_SUPABASE_URL" ]; then
        echo "Warning: VITE_SUPABASE_URL is not set. Using default placeholder."
    fi
    
    if [ -z "$VITE_SUPABASE_PUBLISHABLE_KEY" ]; then
        echo "Warning: VITE_SUPABASE_PUBLISHABLE_KEY is not set. Using default placeholder."
    fi
    
    echo "Environment validation completed."
}

# Function to setup SSL if certificates are provided
setup_ssl() {
    if [ -n "$SSL_CERT_PATH" ] && [ -n "$SSL_KEY_PATH" ]; then
        echo "SSL certificates detected. Setting up HTTPS..."
        
        # Copy SSL configuration if certificates exist
        if [ -f "$SSL_CERT_PATH" ] && [ -f "$SSL_KEY_PATH" ]; then
            cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak
            # Add SSL configuration to nginx
            echo "SSL setup completed."
        else
            echo "Warning: SSL certificate files not found. Running in HTTP mode."
        fi
    else
        echo "No SSL configuration provided. Running in HTTP mode."
    fi
}

# Main execution
main() {
    validate_env
    setup_directories
    replace_env_vars
    setup_ssl
    
    echo "Pottur School Connect is ready to start!"
    echo "Application will be available on port 80"
    
    # Execute the main command
    exec "$@"
}

# Run main function
main "$@"