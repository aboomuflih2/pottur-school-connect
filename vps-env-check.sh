#!/bin/bash

# VPS Environment Variables and Configuration Check Script
# This script validates environment variables and configuration files

echo "=== VPS Environment Variables and Configuration Check ==="
echo "Generated at: $(date)"
echo "========================================================"

# Function to check if a value looks like a placeholder
is_placeholder() {
    local value="$1"
    case "$value" in
        "your-*" | "YOUR_*" | "<*>" | "[*]" | "*example*" | "*placeholder*" | "*change-me*" | "*replace*")
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Function to mask sensitive values for display
mask_sensitive() {
    local value="$1"
    local length=${#value}
    if [ $length -gt 8 ]; then
        echo "${value:0:4}...${value: -4}"
    elif [ $length -gt 4 ]; then
        echo "${value:0:2}...${value: -2}"
    else
        echo "***"
    fi
}

# Check for environment files
echo "1. Environment Files Check:"
ENV_FILES=(
    ".env"
    ".env.local"
    ".env.production"
    ".env.vps"
    "docker-compose.yml"
    "docker-compose.vps.yml"
    "package.json"
)

for file in "${ENV_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
        # Check file permissions
        perms=$(stat -c "%a" "$file" 2>/dev/null || stat -f "%A" "$file" 2>/dev/null)
        if [ -n "$perms" ]; then
            echo "  Permissions: $perms"
            if [ "$perms" -gt 644 ]; then
                echo "  ⚠ File permissions may be too open for security"
            fi
        fi
        # Check file size
        size=$(wc -c < "$file" 2>/dev/null)
        if [ -n "$size" ] && [ "$size" -eq 0 ]; then
            echo "  ⚠ File is empty"
        fi
    else
        echo "✗ $file not found"
    fi
done

# Load and validate .env.vps
echo "\n2. VPS Environment Variables (.env.vps):"
if [ -f ".env.vps" ]; then
    echo "✓ Loading .env.vps file"
    
    # Read .env.vps line by line
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip comments and empty lines
        if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
            continue
        fi
        
        # Extract variable name and value
        if [[ "$line" =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
            var_name="${BASH_REMATCH[1]}"
            var_value="${BASH_REMATCH[2]}"
            
            # Remove quotes if present
            var_value=$(echo "$var_value" | sed 's/^["\x27]\|["\x27]$//g')
            
            # Export the variable
            export "$var_name"="$var_value"
        fi
    done < ".env.vps"
    
    echo "✓ Environment variables loaded from .env.vps"
else
    echo "✗ .env.vps file not found"
    echo "Please create .env.vps with your VPS configuration"
fi

# Check critical environment variables
echo "\n3. Critical Environment Variables Validation:"

# Supabase variables
echo "\nSupabase Configuration:"
SUPABASE_VARS=(
    "VITE_SUPABASE_URL:required"
    "VITE_SUPABASE_ANON_KEY:required"
    "SUPABASE_SERVICE_ROLE_KEY:optional"
    "SUPABASE_JWT_SECRET:optional"
)

for var_info in "${SUPABASE_VARS[@]}"; do
    var_name=$(echo "$var_info" | cut -d':' -f1)
    var_requirement=$(echo "$var_info" | cut -d':' -f2)
    var_value="${!var_name}"
    
    if [ -n "$var_value" ]; then
        if is_placeholder "$var_value"; then
            echo "✗ $var_name: Contains placeholder value"
        else
            masked_value=$(mask_sensitive "$var_value")
            echo "✓ $var_name: $masked_value"
            
            # Validate Supabase URL format
            if [[ "$var_name" == "VITE_SUPABASE_URL" ]]; then
                if [[ "$var_value" =~ ^https://[a-zA-Z0-9-]+\.supabase\.co$ ]]; then
                    echo "  ✓ Valid Supabase URL format"
                else
                    echo "  ⚠ Unusual Supabase URL format (may be self-hosted)"
                fi
            fi
            
            # Validate key formats
            if [[ "$var_name" == *"_KEY" ]]; then
                key_length=${#var_value}
                if [ "$key_length" -lt 20 ]; then
                    echo "  ⚠ Key seems too short ($key_length characters)"
                elif [ "$key_length" -gt 200 ]; then
                    echo "  ⚠ Key seems too long ($key_length characters)"
                else
                    echo "  ✓ Key length looks reasonable ($key_length characters)"
                fi
            fi
        fi
    else
        if [ "$var_requirement" = "required" ]; then
            echo "✗ $var_name: Not set (REQUIRED)"
        else
            echo "⚠ $var_name: Not set (optional)"
        fi
    fi
done

# Database variables (if using custom database)
echo "\nDatabase Configuration:"
DB_VARS=(
    "DATABASE_URL:optional"
    "DB_HOST:optional"
    "DB_PORT:optional"
    "DB_NAME:optional"
    "DB_USER:optional"
    "DB_PASSWORD:optional"
)

db_vars_found=false
for var_info in "${DB_VARS[@]}"; do
    var_name=$(echo "$var_info" | cut -d':' -f1)
    var_value="${!var_name}"
    
    if [ -n "$var_value" ]; then
        db_vars_found=true
        if is_placeholder "$var_value"; then
            echo "✗ $var_name: Contains placeholder value"
        else
            if [[ "$var_name" == *"PASSWORD"* ]]; then
                echo "✓ $var_name: $(mask_sensitive "$var_value")"
            else
                echo "✓ $var_name: $var_value"
            fi
        fi
    fi
done

if [ "$db_vars_found" = false ]; then
    echo "⚠ No custom database variables found (using Supabase only)"
fi

# Application variables
echo "\nApplication Configuration:"
APP_VARS=(
    "NODE_ENV:optional"
    "PORT:optional"
    "VITE_APP_URL:optional"
    "VITE_API_URL:optional"
    "JWT_SECRET:optional"
    "SESSION_SECRET:optional"
)

for var_info in "${APP_VARS[@]}"; do
    var_name=$(echo "$var_info" | cut -d':' -f1)
    var_value="${!var_name}"
    
    if [ -n "$var_value" ]; then
        if is_placeholder "$var_value"; then
            echo "✗ $var_name: Contains placeholder value"
        else
            if [[ "$var_name" == *"SECRET"* ]]; then
                echo "✓ $var_name: $(mask_sensitive "$var_value")"
            else
                echo "✓ $var_name: $var_value"
            fi
        fi
    else
        echo "⚠ $var_name: Not set"
    fi
done

# Check Docker environment variables
echo "\n4. Docker Environment Check:"
if command -v docker &> /dev/null; then
    echo "✓ Docker is available"
    
    # Check if docker-compose files have environment sections
    for compose_file in "docker-compose.yml" "docker-compose.vps.yml"; do
        if [ -f "$compose_file" ]; then
            echo "\nChecking $compose_file:"
            
            # Check for environment sections
            if grep -q "environment:" "$compose_file"; then
                echo "✓ Environment section found"
                
                # Extract environment variables
                env_vars=$(grep -A 20 "environment:" "$compose_file" | grep -E "^[[:space:]]*-[[:space:]]*[A-Z_]+=" | head -10)
                if [ -n "$env_vars" ]; then
                    echo "Environment variables in $compose_file:"
                    echo "$env_vars" | while read -r line; do
                        var_line=$(echo "$line" | sed 's/^[[:space:]]*-[[:space:]]*//')
                        var_name=$(echo "$var_line" | cut -d'=' -f1)
                        echo "  - $var_name"
                    done
                fi
            else
                echo "⚠ No environment section found"
            fi
            
            # Check for env_file references
            if grep -q "env_file:" "$compose_file"; then
                echo "✓ env_file reference found"
                env_files=$(grep -A 5 "env_file:" "$compose_file" | grep -E "^[[:space:]]*-" | sed 's/^[[:space:]]*-[[:space:]]*//')
                echo "Referenced env files:"
                echo "$env_files" | while read -r file; do
                    if [ -f "$file" ]; then
                        echo "  ✓ $file (exists)"
                    else
                        echo "  ✗ $file (missing)"
                    fi
                done
            fi
        fi
    done
else
    echo "✗ Docker not available"
fi

# Check Node.js configuration
echo "\n5. Node.js Configuration Check:"
if [ -f "package.json" ]; then
    echo "✓ package.json found"
    
    # Check for scripts
    if command -v node &> /dev/null; then
        echo "✓ Node.js is available"
        node_version=$(node --version)
        echo "  Version: $node_version"
        
        # Check npm scripts
        scripts=$(node -e "const pkg = require('./package.json'); console.log(Object.keys(pkg.scripts || {}).join(', '))" 2>/dev/null)
        if [ -n "$scripts" ]; then
            echo "  Available scripts: $scripts"
        fi
    else
        echo "✗ Node.js not available"
    fi
    
    # Check for dependencies
    if command -v jq &> /dev/null; then
        deps=$(jq -r '.dependencies | keys | join(", ")' package.json 2>/dev/null)
        if [ -n "$deps" ] && [ "$deps" != "null" ]; then
            echo "  Dependencies: $deps"
        fi
    fi
else
    echo "✗ package.json not found"
fi

# Security check
echo "\n6. Security Configuration Check:"
echo "Checking for potential security issues..."

# Check for exposed secrets in files
SECRET_PATTERNS=(
    "password.*=.*[^*]"
    "secret.*=.*[^*]"
    "key.*=.*[^*]"
    "token.*=.*[^*]"
)

security_issues=false
for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -ri "$pattern" .env* 2>/dev/null | grep -v "\*\*\*" | grep -v "your-" | grep -v "<" | head -5; then
        security_issues=true
    fi
done

if [ "$security_issues" = true ]; then
    echo "⚠ Potential security issues found above"
    echo "  Consider using environment variables or secrets management"
else
    echo "✓ No obvious security issues in environment files"
fi

# Check file permissions
echo "\nFile permissions check:"
for file in .env*; do
    if [ -f "$file" ]; then
        perms=$(stat -c "%a" "$file" 2>/dev/null || stat -f "%A" "$file" 2>/dev/null)
        if [ -n "$perms" ]; then
            if [ "$perms" -gt 600 ]; then
                echo "⚠ $file has permissions $perms (consider 600 for security)"
            else
                echo "✓ $file has secure permissions ($perms)"
            fi
        fi
    fi
done

# Configuration validation summary
echo "\n7. Configuration Validation Summary:"
echo "Checking overall configuration health..."

# Count missing required variables
missing_required=0
required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_required=$((missing_required + 1))
    fi
done

if [ $missing_required -eq 0 ]; then
    echo "✓ All required environment variables are set"
else
    echo "✗ $missing_required required environment variables are missing"
fi

# Check if we can connect to Supabase
if [ -n "$VITE_SUPABASE_URL" ] && [ -n "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "\nTesting Supabase connectivity..."
    if command -v curl &> /dev/null; then
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
            -H "apikey: $VITE_SUPABASE_ANON_KEY" \
            --connect-timeout 10 \
            "$VITE_SUPABASE_URL/rest/v1/" 2>/dev/null)
        
        http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d':' -f2)
        
        if [ "$http_status" -eq 200 ] || [ "$http_status" -eq 401 ]; then
            echo "✓ Supabase connection successful"
        else
            echo "✗ Supabase connection failed (Status: $http_status)"
        fi
    else
        echo "⚠ Cannot test Supabase connectivity (curl not available)"
    fi
fi

echo "\n========================================================"
echo "Environment and configuration check complete."
echo "\nNext steps:"
echo "1. Fix any missing required environment variables"
echo "2. Replace any placeholder values with actual configuration"
echo "3. Ensure file permissions are secure (600 for .env files)"
echo "4. Test connectivity to external services"
echo "5. Run the application to verify configuration works"
echo "========================================================"