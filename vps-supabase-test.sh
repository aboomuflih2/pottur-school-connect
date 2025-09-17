#!/bin/bash

# VPS Supabase Connection Test Script
# This script tests the connection to self-hosted Supabase instance

echo "=== VPS Supabase Connection Test ==="
echo "Generated at: $(date)"
echo "======================================"

# Load environment variables
if [ -f ".env.vps" ]; then
    echo "✓ Loading .env.vps file"
    export $(cat .env.vps | grep -v '^#' | xargs)
else
    echo "✗ .env.vps file not found"
    echo "Please ensure .env.vps exists with Supabase configuration"
    exit 1
fi

# Check required environment variables
echo "\n1. Environment Variables Check:"
required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
        echo "✗ $var is not set"
    else
        echo "✓ $var is set"
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "\n✗ Missing required environment variables: ${missing_vars[*]}"
    echo "Please update .env.vps with the correct values"
    exit 1
fi

# Test basic connectivity to Supabase URL
echo "\n2. Basic Connectivity Test:"
echo "Testing connection to: $VITE_SUPABASE_URL"

if command -v curl &> /dev/null; then
    # Test basic HTTP connectivity
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$VITE_SUPABASE_URL")
    if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 404 ]; then
        echo "✓ HTTP connection successful (Status: $HTTP_STATUS)"
    else
        echo "✗ HTTP connection failed (Status: $HTTP_STATUS)"
    fi
    
    # Test Supabase REST API endpoint
    REST_URL="$VITE_SUPABASE_URL/rest/v1/"
    echo "\nTesting REST API: $REST_URL"
    REST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "apikey: $VITE_SUPABASE_ANON_KEY" "$REST_URL")
    if [ "$REST_STATUS" -eq 200 ] || [ "$REST_STATUS" -eq 401 ]; then
        echo "✓ REST API accessible (Status: $REST_STATUS)"
    else
        echo "✗ REST API not accessible (Status: $REST_STATUS)"
    fi
    
    # Test Supabase Auth endpoint
    AUTH_URL="$VITE_SUPABASE_URL/auth/v1/settings"
    echo "\nTesting Auth API: $AUTH_URL"
    AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "apikey: $VITE_SUPABASE_ANON_KEY" "$AUTH_URL")
    if [ "$AUTH_STATUS" -eq 200 ]; then
        echo "✓ Auth API accessible (Status: $AUTH_STATUS)"
    else
        echo "✗ Auth API not accessible (Status: $AUTH_STATUS)"
    fi
else
    echo "✗ curl not available, cannot test HTTP connectivity"
fi

# Test with Node.js if available
echo "\n3. Node.js Supabase Client Test:"
if command -v node &> /dev/null; then
    echo "✓ Node.js is available"
    
    # Create a temporary test script
    cat > /tmp/supabase-test.js << 'EOF'
const https = require('https');
const http = require('http');
const url = require('url');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('✗ Missing Supabase configuration');
    process.exit(1);
}

const testEndpoint = (endpoint, description) => {
    return new Promise((resolve) => {
        const fullUrl = `${SUPABASE_URL}${endpoint}`;
        const parsedUrl = url.parse(fullUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.path,
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            timeout: 10000
        };
        
        const req = client.request(options, (res) => {
            console.log(`${description}: Status ${res.statusCode}`);
            if (res.statusCode === 200 || res.statusCode === 401) {
                console.log(`✓ ${description} - Connection successful`);
            } else {
                console.log(`⚠ ${description} - Unexpected status code`);
            }
            resolve();
        });
        
        req.on('error', (err) => {
            console.log(`✗ ${description} - Connection failed: ${err.message}`);
            resolve();
        });
        
        req.on('timeout', () => {
            console.log(`✗ ${description} - Connection timeout`);
            req.destroy();
            resolve();
        });
        
        req.end();
    });
};

async function runTests() {
    console.log('Testing Supabase endpoints...');
    await testEndpoint('/rest/v1/', 'REST API');
    await testEndpoint('/auth/v1/settings', 'Auth API');
    await testEndpoint('/realtime/v1/', 'Realtime API');
    console.log('Node.js tests completed.');
}

runTests().catch(console.error);
EOF
    
    # Run the test
    VITE_SUPABASE_URL="$VITE_SUPABASE_URL" VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" node /tmp/supabase-test.js
    
    # Clean up
    rm -f /tmp/supabase-test.js
else
    echo "✗ Node.js not available for advanced testing"
fi

# Check if Supabase is running in Docker
echo "\n4. Docker Supabase Services Check:"
if command -v docker &> /dev/null; then
    SUPABASE_CONTAINERS=$(docker ps --filter "name=supabase" --format "{{.Names}}")
    if [ -z "$SUPABASE_CONTAINERS" ]; then
        echo "✗ No Supabase containers found running"
        echo "  Check if Supabase is started with: docker-compose up -d"
    else
        echo "✓ Found running Supabase containers:"
        docker ps --filter "name=supabase" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    fi
else
    echo "✗ Docker not available"
fi

# Network connectivity test
echo "\n5. Network Connectivity Test:"
SUPABASE_HOST=$(echo "$VITE_SUPABASE_URL" | sed -e 's|^[^/]*//||' -e 's|/.*$||')
echo "Testing network connectivity to: $SUPABASE_HOST"

if command -v ping &> /dev/null; then
    if ping -c 3 "$SUPABASE_HOST" > /dev/null 2>&1; then
        echo "✓ Network connectivity to Supabase host is working"
    else
        echo "✗ Cannot reach Supabase host via ping"
    fi
else
    echo "⚠ ping command not available"
fi

# DNS resolution test
if command -v nslookup &> /dev/null; then
    echo "\nDNS resolution for $SUPABASE_HOST:"
    nslookup "$SUPABASE_HOST"
elif command -v dig &> /dev/null; then
    echo "\nDNS resolution for $SUPABASE_HOST:"
    dig "$SUPABASE_HOST"
fi

echo "\n======================================"
echo "Supabase connection test complete."
echo "\nTroubleshooting tips:"
echo "- If connection fails, check if Supabase is running: docker-compose ps"
echo "- Verify .env.vps has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
echo "- Check firewall settings on VPS"
echo "- Ensure Supabase services are accessible on the configured ports"
echo "======================================"