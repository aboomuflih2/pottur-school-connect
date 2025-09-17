#!/bin/bash

# VPS Docker Diagnostic Script
# This script checks the status of Docker containers and services on the VPS

echo "=== VPS Docker Diagnostic Report ==="
echo "Generated at: $(date)"
echo "========================================"

# Check if Docker is installed and running
echo "\n1. Docker Service Status:"
if command -v docker &> /dev/null; then
    echo "✓ Docker is installed"
    if systemctl is-active --quiet docker; then
        echo "✓ Docker service is running"
    else
        echo "✗ Docker service is not running"
        echo "  Try: sudo systemctl start docker"
    fi
else
    echo "✗ Docker is not installed"
    exit 1
fi

# Check Docker version
echo "\n2. Docker Version:"
docker --version

# Check Docker Compose version
echo "\n3. Docker Compose Version:"
if command -v docker-compose &> /dev/null; then
    docker-compose --version
else
    echo "✗ Docker Compose not found"
fi

# List all containers
echo "\n4. All Docker Containers:"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"

# List running containers
echo "\n5. Running Containers:"
RUNNING_CONTAINERS=$(docker ps --format "{{.Names}}")
if [ -z "$RUNNING_CONTAINERS" ]; then
    echo "✗ No containers are currently running"
else
    echo "✓ Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"
fi

# Check specific containers for Pottur School Connect
echo "\n6. Pottur School Connect Containers:"
POTTUR_CONTAINERS=$(docker ps -a --filter "name=pottur" --format "{{.Names}}")
if [ -z "$POTTUR_CONTAINERS" ]; then
    echo "✗ No Pottur School Connect containers found"
else
    echo "✓ Found Pottur containers:"
    docker ps -a --filter "name=pottur" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"
fi

# Check Docker networks
echo "\n7. Docker Networks:"
docker network ls

# Check Docker volumes
echo "\n8. Docker Volumes:"
docker volume ls

# Check Docker disk usage
echo "\n9. Docker Disk Usage:"
docker system df

# Check for any stopped containers
echo "\n10. Stopped Containers:"
STOPPED_CONTAINERS=$(docker ps -a --filter "status=exited" --format "{{.Names}}")
if [ -z "$STOPPED_CONTAINERS" ]; then
    echo "✓ No stopped containers"
else
    echo "⚠ Stopped containers found:"
    docker ps -a --filter "status=exited" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
fi

# Check container logs for errors (last 50 lines)
echo "\n11. Recent Container Logs (Last 50 lines):"
for container in $(docker ps --format "{{.Names}}"); do
    echo "\n--- Logs for $container ---"
    docker logs --tail 50 "$container" 2>&1 | head -20
    echo "(showing first 20 of last 50 lines)"
done

# Check Docker daemon logs
echo "\n12. Docker Daemon Status:"
journalctl -u docker.service --no-pager -n 10

# Memory and CPU usage of containers
echo "\n13. Container Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"

echo "\n========================================"
echo "Diagnostic complete. Check the output above for any issues."
echo "Common fixes:"
echo "- If containers are stopped: docker-compose up -d"
echo "- If Docker service is down: sudo systemctl start docker"
echo "- If containers are failing: check logs with 'docker logs <container_name>'"
echo "========================================"