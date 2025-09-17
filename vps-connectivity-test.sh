#!/bin/bash

# VPS Frontend-Backend Connectivity Test Script
# This script tests the connectivity between frontend and backend services

echo "=== VPS Frontend-Backend Connectivity Test ==="
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

# Check if services are running
echo "\n1. Service Status Check:"
if command -v docker &> /dev/null; then
    echo "Checking Docker containers..."
    
    # Check frontend container
    FRONTEND_CONTAINER=$(docker ps --filter "name=frontend" --format "{{.Names}}" | head -1)
    if [ -n "$FRONTEND_CONTAINER" ]; then
        echo "✓ Frontend container running: $FRONTEND_CONTAINER"
        FRONTEND_PORT=$(docker port "$FRONTEND_CONTAINER" | grep "80/tcp" | cut -d':' -f2)
        if [ -n "$FRONTEND_PORT" ]; then
            echo "  Frontend port: $FRONTEND_PORT"
        fi
    else
        echo "✗ No frontend container found"
    fi
    
    # Check backend container
    BACKEND_CONTAINER=$(docker ps --filter "name=backend" --format "{{.Names}}" | head -1)
    if [ -n "$BACKEND_CONTAINER" ]; then
        echo "✓ Backend container running: $BACKEND_CONTAINER"
        BACKEND_PORT=$(docker port "$BACKEND_CONTAINER" | grep "3000/tcp" | cut -d':' -f2)
        if [ -n "$BACKEND_PORT" ]; then
            echo "  Backend port: $BACKEND_PORT"
        fi
    else
        echo "✗ No backend container found"
    fi
    
    # Check all running containers
    echo "\nAll running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "✗ Docker not available"
fi

# Test frontend accessibility
echo "\n2. Frontend Accessibility Test:"
FRONTEND_URLS=(
    "http://localhost:3000"
    "http://localhost:5173"
    "http://127.0.0.1:3000"
    "http://127.0.0.1:5173"
)

for url in "${FRONTEND_URLS[@]}"; do
    echo "Testing: $url"
    if command -v curl &> /dev/null; then
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url")
        if [ "$HTTP_STATUS" -eq 200 ]; then
            echo "✓ Frontend accessible at $url (Status: $HTTP_STATUS)"
            FRONTEND_URL="$url"
            break
        else
            echo "✗ Frontend not accessible at $url (Status: $HTTP_STATUS)"
        fi
    else
        echo "✗ curl not available for testing"
        break
    fi
done

# Test backend accessibility
echo "\n3. Backend API Accessibility Test:"
BACKEND_URLS=(
    "http://localhost:3001"
    "http://localhost:8000"
    "http://127.0.0.1:3001"
    "http://127.0.0.1:8000"
)

for url in "${BACKEND_URLS[@]}"; do
    echo "Testing: $url"
    if command -v curl &> /dev/null; then
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url")
        if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 404 ]; then
            echo "✓ Backend accessible at $url (Status: $HTTP_STATUS)"
            BACKEND_URL="$url"
            break
        else
            echo "✗ Backend not accessible at $url (Status: $HTTP_STATUS)"
        fi
    else
        echo "✗ curl not available for testing"
        break
    fi
done

# Test API endpoints
echo "\n4. API Endpoints Test:"
if [ -n "$BACKEND_URL" ]; then
    API_ENDPOINTS=(
        "/api/health"
        "/api/status"
        "/health"
        "/"
    )
    
    for endpoint in "${API_ENDPOINTS[@]}"; do
        echo "Testing: $BACKEND_URL$endpoint"
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$BACKEND_URL$endpoint")
        if [ "$HTTP_STATUS" -eq 200 ]; then
            echo "✓ API endpoint accessible: $endpoint (Status: $HTTP_STATUS)"
        else
            echo "✗ API endpoint not accessible: $endpoint (Status: $HTTP_STATUS)"
        fi
    done
else
    echo "✗ No backend URL available for API testing"
fi

# Test CORS configuration
echo "\n5. CORS Configuration Test:"
if [ -n "$BACKEND_URL" ] && [ -n "$FRONTEND_URL" ]; then
    echo "Testing CORS from frontend ($FRONTEND_URL) to backend ($BACKEND_URL)"
    
    # Create a temporary test script for CORS
    cat > /tmp/cors-test.js << EOF
const http = require('http');
const https = require('https');
const url = require('url');

const backendUrl = process.argv[2];
const frontendUrl = process.argv[3];

if (!backendUrl || !frontendUrl) {
    console.log('Usage: node cors-test.js <backend-url> <frontend-url>');
    process.exit(1);
}

const parsedUrl = url.parse(backendUrl);
const client = parsedUrl.protocol === 'https:' ? https : http;

const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.path,
    method: 'OPTIONS',
    headers: {
        'Origin': frontendUrl,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
    },
    timeout: 10000
};

const req = client.request(options, (res) => {
    console.log(\`CORS preflight status: \${res.statusCode}\`);
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': res.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': res.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': res.headers['access-control-allow-headers']
    };
    
    console.log('CORS Headers:', corsHeaders);
    
    if (corsHeaders['Access-Control-Allow-Origin'] === '*' || 
        corsHeaders['Access-Control-Allow-Origin'] === frontendUrl) {
        console.log('✓ CORS configuration appears correct');
    } else {
        console.log('✗ CORS configuration may be incorrect');
    }
});

req.on('error', (err) => {
    console.log(\`✗ CORS test failed: \${err.message}\`);
});

req.on('timeout', () => {
    console.log('✗ CORS test timeout');
    req.destroy();
});

req.end();
EOF
    
    if command -v node &> /dev/null; then
        node /tmp/cors-test.js "$BACKEND_URL" "$FRONTEND_URL"
        rm -f /tmp/cors-test.js
    else
        echo "✗ Node.js not available for CORS testing"
    fi
else
    echo "✗ Cannot test CORS - frontend or backend URL not available"
fi

# Test network connectivity between containers
echo "\n6. Inter-Container Network Test:"
if [ -n "$FRONTEND_CONTAINER" ] && [ -n "$BACKEND_CONTAINER" ]; then
    echo "Testing network connectivity between containers..."
    
    # Test if frontend can reach backend
    docker exec "$FRONTEND_CONTAINER" sh -c "ping -c 3 $BACKEND_CONTAINER" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✓ Frontend container can reach backend container"
    else
        echo "✗ Frontend container cannot reach backend container"
    fi
    
    # Check Docker network
    echo "\nDocker networks:"
    docker network ls
    
    echo "\nContainers in networks:"
    for network in $(docker network ls --format "{{.Name}}" | grep -v bridge | grep -v host | grep -v none); do
        echo "Network: $network"
        docker network inspect "$network" --format '{{range .Containers}}{{.Name}} {{end}}'
    done
else
    echo "✗ Cannot test inter-container connectivity - containers not found"
fi

# Test port accessibility
echo "\n7. Port Accessibility Test:"
PORTS=("3000" "3001" "5173" "8000" "80" "443")

for port in "${PORTS[@]}"; do
    if command -v nc &> /dev/null; then
        if nc -z localhost "$port" 2>/dev/null; then
            echo "✓ Port $port is open"
        else
            echo "✗ Port $port is closed or not accessible"
        fi
    elif command -v telnet &> /dev/null; then
        if timeout 3 telnet localhost "$port" 2>/dev/null | grep -q "Connected"; then
            echo "✓ Port $port is open"
        else
            echo "✗ Port $port is closed or not accessible"
        fi
    else
        echo "⚠ No port testing tools available (nc or telnet)"
        break
    fi
done

# Check firewall status
echo "\n8. Firewall Status:"
if command -v ufw &> /dev/null; then
    echo "UFW Status:"
    ufw status
elif command -v iptables &> /dev/null; then
    echo "IPTables rules (first 10):"
    iptables -L | head -10
else
    echo "⚠ No firewall tools found"
fi

echo "\n==============================================="
echo "Frontend-Backend connectivity test complete."
echo "\nTroubleshooting tips:"
echo "- If containers are not running: docker-compose up -d"
echo "- If ports are not accessible: check firewall settings"
echo "- If CORS errors occur: update backend CORS configuration"
echo "- If inter-container communication fails: check Docker network configuration"
echo "- Check container logs: docker logs <container-name>"
echo "==============================================="