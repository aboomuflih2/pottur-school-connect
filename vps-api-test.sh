#!/bin/bash

# VPS API Endpoints and Authentication Flow Test Script
# This script tests API endpoints and authentication functionality

echo "=== VPS API Endpoints and Authentication Test ==="
echo "Generated at: $(date)"
echo "==============================================="

# Load environment variables
if [ -f ".env.vps" ]; then
    echo "✓ Loading .env.vps file"
    export $(cat .env.vps | grep -v '^#' | xargs)
else
    echo "✗ .env.vps file not found"
    echo "Please ensure .env.vps exists with configuration"
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

# Detect API base URLs
echo "\n2. API Base URL Detection:"
API_URLS=(
    "http://localhost:3001"
    "http://localhost:8000"
    "http://127.0.0.1:3001"
    "http://127.0.0.1:8000"
    "$VITE_SUPABASE_URL"
)

API_BASE_URL=""
for url in "${API_URLS[@]}"; do
    if [ -n "$url" ]; then
        echo "Testing: $url"
        if command -v curl &> /dev/null; then
            HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url")
            if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 404 ]; then
                echo "✓ API accessible at $url (Status: $HTTP_STATUS)"
                API_BASE_URL="$url"
                break
            else
                echo "✗ API not accessible at $url (Status: $HTTP_STATUS)"
            fi
        fi
    fi
done

if [ -z "$API_BASE_URL" ]; then
    echo "✗ No accessible API base URL found"
    echo "Using Supabase URL for testing: $VITE_SUPABASE_URL"
    API_BASE_URL="$VITE_SUPABASE_URL"
fi

# Test Supabase API endpoints
echo "\n3. Supabase API Endpoints Test:"
SUPABASE_ENDPOINTS=(
    "/rest/v1/"
    "/auth/v1/settings"
    "/auth/v1/signup"
    "/auth/v1/token"
    "/realtime/v1/"
)

for endpoint in "${SUPABASE_ENDPOINTS[@]}"; do
    url="$VITE_SUPABASE_URL$endpoint"
    echo "\nTesting: $url"
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
            -H "apikey: $VITE_SUPABASE_ANON_KEY" \
            -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
            --connect-timeout 10 \
            "$url")
        
        http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d':' -f2)
        response_body=$(echo "$response" | sed '/HTTP_STATUS:/d')
        
        case "$endpoint" in
            "/rest/v1/")
                if [ "$http_status" -eq 200 ] || [ "$http_status" -eq 401 ]; then
                    echo "✓ REST API endpoint accessible (Status: $http_status)"
                else
                    echo "✗ REST API endpoint failed (Status: $http_status)"
                fi
                ;;
            "/auth/v1/settings")
                if [ "$http_status" -eq 200 ]; then
                    echo "✓ Auth settings endpoint accessible (Status: $http_status)"
                    echo "Auth settings: $(echo "$response_body" | head -c 200)..."
                else
                    echo "✗ Auth settings endpoint failed (Status: $http_status)"
                fi
                ;;
            "/auth/v1/signup")
                if [ "$http_status" -eq 400 ] || [ "$http_status" -eq 422 ]; then
                    echo "✓ Auth signup endpoint accessible (Status: $http_status - expected for GET request)"
                else
                    echo "⚠ Auth signup endpoint status: $http_status"
                fi
                ;;
            "/auth/v1/token")
                if [ "$http_status" -eq 400 ] || [ "$http_status" -eq 401 ]; then
                    echo "✓ Auth token endpoint accessible (Status: $http_status - expected without credentials)"
                else
                    echo "⚠ Auth token endpoint status: $http_status"
                fi
                ;;
            "/realtime/v1/")
                if [ "$http_status" -eq 200 ] || [ "$http_status" -eq 426 ]; then
                    echo "✓ Realtime endpoint accessible (Status: $http_status)"
                else
                    echo "✗ Realtime endpoint failed (Status: $http_status)"
                fi
                ;;
        esac
    else
        echo "✗ curl not available for testing"
        break
    fi
done

# Test authentication flow
echo "\n4. Authentication Flow Test:"
echo "Testing authentication with test credentials..."

# Create a test authentication script
cat > /tmp/auth-test.js << 'EOF'
const https = require('https');
const http = require('http');
const url = require('url');
const querystring = require('querystring');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('✗ Missing Supabase configuration');
    process.exit(1);
}

const makeRequest = (endpoint, method = 'GET', data = null) => {
    return new Promise((resolve) => {
        const fullUrl = `${SUPABASE_URL}${endpoint}`;
        const parsedUrl = url.parse(fullUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const postData = data ? JSON.stringify(data) : null;
        
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.path,
            method: method,
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000
        };
        
        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }
        
        const req = client.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => {
                responseBody += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: responseBody
                });
            });
        });
        
        req.on('error', (err) => {
            resolve({
                error: err.message,
                statusCode: 0
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve({
                error: 'Request timeout',
                statusCode: 0
            });
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
};

async function testAuth() {
    console.log('\n--- Authentication Flow Test ---');
    
    // Test 1: Get auth settings
    console.log('\n1. Testing auth settings...');
    const settingsResponse = await makeRequest('/auth/v1/settings');
    if (settingsResponse.statusCode === 200) {
        console.log('✓ Auth settings accessible');
        try {
            const settings = JSON.parse(settingsResponse.body);
            console.log(`   External providers: ${Object.keys(settings.external || {}).join(', ') || 'None'}`);
            console.log(`   Email signup: ${settings.disable_signup ? 'Disabled' : 'Enabled'}`);
        } catch (e) {
            console.log('   Settings format: Raw response');
        }
    } else {
        console.log(`✗ Auth settings failed (Status: ${settingsResponse.statusCode})`);
    }
    
    // Test 2: Test signup endpoint (should fail without proper data)
    console.log('\n2. Testing signup endpoint...');
    const signupResponse = await makeRequest('/auth/v1/signup', 'POST', {
        email: 'test@example.com',
        password: 'testpassword123'
    });
    
    if (signupResponse.statusCode === 400 || signupResponse.statusCode === 422) {
        console.log('✓ Signup endpoint accessible (validation working)');
    } else if (signupResponse.statusCode === 200) {
        console.log('⚠ Signup endpoint accessible (test user may have been created)');
    } else {
        console.log(`✗ Signup endpoint failed (Status: ${signupResponse.statusCode})`);
        if (signupResponse.error) {
            console.log(`   Error: ${signupResponse.error}`);
        }
    }
    
    // Test 3: Test login endpoint
    console.log('\n3. Testing login endpoint...');
    const loginResponse = await makeRequest('/auth/v1/token?grant_type=password', 'POST', {
        email: 'test@example.com',
        password: 'wrongpassword'
    });
    
    if (loginResponse.statusCode === 400 || loginResponse.statusCode === 401) {
        console.log('✓ Login endpoint accessible (authentication working)');
    } else {
        console.log(`⚠ Login endpoint status: ${loginResponse.statusCode}`);
    }
    
    // Test 4: Test protected endpoint
    console.log('\n4. Testing protected REST endpoint...');
    const restResponse = await makeRequest('/rest/v1/');
    if (restResponse.statusCode === 200 || restResponse.statusCode === 401) {
        console.log('✓ REST API accessible');
    } else {
        console.log(`✗ REST API failed (Status: ${restResponse.statusCode})`);
    }
    
    console.log('\n--- Authentication Test Complete ---');
}

testAuth().catch(console.error);
EOF

if command -v node &> /dev/null; then
    VITE_SUPABASE_URL="$VITE_SUPABASE_URL" VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" node /tmp/auth-test.js
    rm -f /tmp/auth-test.js
else
    echo "✗ Node.js not available for authentication testing"
fi

# Test custom API endpoints (if any)
echo "\n5. Custom API Endpoints Test:"
if [ "$API_BASE_URL" != "$VITE_SUPABASE_URL" ]; then
    CUSTOM_ENDPOINTS=(
        "/api/health"
        "/api/status"
        "/api/auth/login"
        "/api/auth/register"
        "/api/users"
        "/health"
        "/status"
    )
    
    for endpoint in "${CUSTOM_ENDPOINTS[@]}"; do
        url="$API_BASE_URL$endpoint"
        echo "\nTesting: $url"
        
        if command -v curl &> /dev/null; then
            HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url")
            case "$HTTP_STATUS" in
                200)
                    echo "✓ Endpoint accessible (Status: $HTTP_STATUS)"
                    ;;
                401|403)
                    echo "✓ Endpoint accessible but requires authentication (Status: $HTTP_STATUS)"
                    ;;
                404)
                    echo "⚠ Endpoint not found (Status: $HTTP_STATUS)"
                    ;;
                500|502|503)
                    echo "✗ Server error (Status: $HTTP_STATUS)"
                    ;;
                *)
                    echo "⚠ Unexpected status (Status: $HTTP_STATUS)"
                    ;;
            esac
        fi
    done
else
    echo "⚠ No custom API endpoints to test (using Supabase only)"
fi

# Test CORS for authentication
echo "\n6. CORS Authentication Test:"
echo "Testing CORS headers for authentication endpoints..."

if command -v curl &> /dev/null; then
    # Test CORS preflight for auth endpoint
    echo "\nTesting CORS preflight for auth endpoint:"
    cors_response=$(curl -s -I \
        -X OPTIONS \
        -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        "$VITE_SUPABASE_URL/auth/v1/token")
    
    if echo "$cors_response" | grep -qi "access-control-allow-origin"; then
        echo "✓ CORS headers present for auth endpoint"
        echo "CORS headers:"
        echo "$cors_response" | grep -i "access-control"
    else
        echo "✗ CORS headers missing for auth endpoint"
    fi
fi

# Performance test
echo "\n7. API Performance Test:"
echo "Testing response times for key endpoints..."

if command -v curl &> /dev/null; then
    PERF_ENDPOINTS=(
        "$VITE_SUPABASE_URL/auth/v1/settings"
        "$VITE_SUPABASE_URL/rest/v1/"
    )
    
    for endpoint in "${PERF_ENDPOINTS[@]}"; do
        echo "\nTesting performance: $endpoint"
        response_time=$(curl -s -o /dev/null -w "%{time_total}" \
            -H "apikey: $VITE_SUPABASE_ANON_KEY" \
            --connect-timeout 10 \
            "$endpoint")
        
        if (( $(echo "$response_time < 2.0" | bc -l) )); then
            echo "✓ Good response time: ${response_time}s"
        elif (( $(echo "$response_time < 5.0" | bc -l) )); then
            echo "⚠ Slow response time: ${response_time}s"
        else
            echo "✗ Very slow response time: ${response_time}s"
        fi
    done
fi

echo "\n==============================================="
echo "API and Authentication test complete."
echo "\nSummary:"
echo "- Supabase URL: $VITE_SUPABASE_URL"
echo "- API Base URL: $API_BASE_URL"
echo "\nTroubleshooting tips:"
echo "- If auth endpoints fail: Check Supabase configuration and RLS policies"
echo "- If CORS errors occur: Update Supabase CORS settings"
echo "- If slow responses: Check network connectivity and server resources"
echo "- If 401 errors: Verify API keys and authentication setup"
echo "==============================================="