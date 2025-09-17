#!/bin/bash

# VPS Logs and Error Messages Check Script
# This script collects and analyzes logs from various sources

echo "=== VPS Logs and Error Messages Check ==="
echo "Generated at: $(date)"
echo "=========================================="

# Create logs directory if it doesn't exist
mkdir -p ./vps-logs-$(date +%Y%m%d-%H%M%S)
LOG_DIR="./vps-logs-$(date +%Y%m%d-%H%M%S)"
echo "Logs will be saved to: $LOG_DIR"

# Function to check and display logs
check_logs() {
    local source="$1"
    local command="$2"
    local description="$3"
    
    echo "\n--- $description ---"
    if eval "$command" > "$LOG_DIR/${source}.log" 2>&1; then
        echo "✓ $description logs collected"
        # Show last 20 lines
        echo "Last 20 lines:"
        tail -20 "$LOG_DIR/${source}.log"
        
        # Check for common error patterns
        echo "\nError analysis:"
        local errors=$(grep -i "error\|fail\|exception\|fatal\|critical" "$LOG_DIR/${source}.log" | wc -l)
        local warnings=$(grep -i "warn\|warning" "$LOG_DIR/${source}.log" | wc -l)
        
        if [ "$errors" -gt 0 ]; then
            echo "⚠ Found $errors error(s)"
            echo "Recent errors:"
            grep -i "error\|fail\|exception\|fatal\|critical" "$LOG_DIR/${source}.log" | tail -5
        else
            echo "✓ No errors found"
        fi
        
        if [ "$warnings" -gt 0 ]; then
            echo "⚠ Found $warnings warning(s)"
        fi
    else
        echo "✗ Failed to collect $description logs"
    fi
}

# 1. Docker container logs
echo "\n1. Docker Container Logs:"
if command -v docker &> /dev/null; then
    # Get all running containers
    CONTAINERS=$(docker ps --format "{{.Names}}")
    
    if [ -n "$CONTAINERS" ]; then
        for container in $CONTAINERS; do
            echo "\nCollecting logs for container: $container"
            check_logs "docker-$container" "docker logs --tail 100 $container" "Docker container $container"
        done
    else
        echo "✗ No running containers found"
    fi
    
    # Docker daemon logs
    check_logs "docker-daemon" "journalctl -u docker.service --no-pager -n 100" "Docker daemon"
else
    echo "✗ Docker not available"
fi

# 2. System logs
echo "\n2. System Logs:"
check_logs "syslog" "tail -100 /var/log/syslog" "System log"
check_logs "messages" "tail -100 /var/log/messages" "System messages"
check_logs "kern" "tail -100 /var/log/kern.log" "Kernel log"

# 3. Web server logs (if any)
echo "\n3. Web Server Logs:"
WEB_LOG_PATHS=(
    "/var/log/nginx/error.log"
    "/var/log/nginx/access.log"
    "/var/log/apache2/error.log"
    "/var/log/apache2/access.log"
    "/var/log/httpd/error_log"
    "/var/log/httpd/access_log"
)

for log_path in "${WEB_LOG_PATHS[@]}"; do
    if [ -f "$log_path" ]; then
        log_name=$(basename "$log_path")
        check_logs "webserver-$log_name" "tail -100 $log_path" "Web server $log_name"
    fi
done

# 4. Application logs
echo "\n4. Application Logs:"
APP_LOG_PATHS=(
    "./logs"
    "./log"
    "./var/log"
    "/var/log/app"
    "/opt/app/logs"
)

for log_dir in "${APP_LOG_PATHS[@]}"; do
    if [ -d "$log_dir" ]; then
        echo "\nFound application log directory: $log_dir"
        find "$log_dir" -name "*.log" -type f | while read -r log_file; do
            log_name=$(basename "$log_file")
            check_logs "app-$log_name" "tail -100 $log_file" "Application $log_name"
        done
    fi
done

# 5. Node.js/PM2 logs (if applicable)
echo "\n5. Node.js/PM2 Logs:"
if command -v pm2 &> /dev/null; then
    check_logs "pm2-list" "pm2 list" "PM2 process list"
    check_logs "pm2-logs" "pm2 logs --lines 100" "PM2 application logs"
else
    echo "⚠ PM2 not found"
fi

# 6. Database logs (if applicable)
echo "\n6. Database Logs:"
DB_LOG_PATHS=(
    "/var/log/postgresql/postgresql.log"
    "/var/log/mysql/error.log"
    "/var/log/mongodb/mongod.log"
)

for log_path in "${DB_LOG_PATHS[@]}"; do
    if [ -f "$log_path" ]; then
        log_name=$(basename "$log_path")
        check_logs "db-$log_name" "tail -100 $log_path" "Database $log_name"
    fi
done

# 7. Authentication logs
echo "\n7. Authentication Logs:"
check_logs "auth" "tail -100 /var/log/auth.log" "Authentication log"
check_logs "secure" "tail -100 /var/log/secure" "Security log"

# 8. Memory and disk usage
echo "\n8. System Resource Usage:"
check_logs "memory-usage" "free -h && df -h" "Memory and disk usage"
check_logs "top-processes" "ps aux --sort=-%cpu | head -20" "Top CPU processes"

# 9. Network status
echo "\n9. Network Status:"
check_logs "network-status" "netstat -tulpn" "Network connections"
check_logs "network-interfaces" "ip addr show" "Network interfaces"

# 10. Recent system events
echo "\n10. Recent System Events:"
check_logs "dmesg" "dmesg | tail -50" "Kernel messages"
check_logs "journalctl" "journalctl --no-pager -n 50" "System journal"

# 11. Check for common error patterns across all logs
echo "\n11. Error Pattern Analysis:"
echo "Analyzing all collected logs for common issues..."

# Create combined error report
ERROR_REPORT="$LOG_DIR/error-summary.txt"
echo "=== Error Summary Report ===" > "$ERROR_REPORT"
echo "Generated at: $(date)" >> "$ERROR_REPORT"
echo "" >> "$ERROR_REPORT"

# Common error patterns to look for
ERROR_PATTERNS=(
    "connection refused"
    "connection timeout"
    "permission denied"
    "no such file or directory"
    "out of memory"
    "disk full"
    "port already in use"
    "failed to start"
    "segmentation fault"
    "database connection"
    "authentication failed"
    "ssl certificate"
    "cors error"
    "404 not found"
    "500 internal server error"
)

for pattern in "${ERROR_PATTERNS[@]}"; do
    echo "\nSearching for: $pattern"
    matches=$(grep -ri "$pattern" "$LOG_DIR"/*.log 2>/dev/null | wc -l)
    if [ "$matches" -gt 0 ]; then
        echo "⚠ Found $matches occurrence(s) of '$pattern'"
        echo "\n--- Occurrences of '$pattern' ---" >> "$ERROR_REPORT"
        grep -ri "$pattern" "$LOG_DIR"/*.log 2>/dev/null | head -5 >> "$ERROR_REPORT"
        echo "" >> "$ERROR_REPORT"
    else
        echo "✓ No occurrences of '$pattern'"
    fi
done

# 12. Generate recommendations
echo "\n12. Generating Recommendations:"
RECOMMENDATIONS="$LOG_DIR/recommendations.txt"
echo "=== Troubleshooting Recommendations ===" > "$RECOMMENDATIONS"
echo "Generated at: $(date)" >> "$RECOMMENDATIONS"
echo "" >> "$RECOMMENDATIONS"

# Check for specific issues and provide recommendations
if grep -qi "connection refused" "$LOG_DIR"/*.log 2>/dev/null; then
    echo "- Connection refused errors found. Check if services are running and ports are open." >> "$RECOMMENDATIONS"
fi

if grep -qi "permission denied" "$LOG_DIR"/*.log 2>/dev/null; then
    echo "- Permission denied errors found. Check file/directory permissions and user privileges." >> "$RECOMMENDATIONS"
fi

if grep -qi "out of memory" "$LOG_DIR"/*.log 2>/dev/null; then
    echo "- Memory issues detected. Consider increasing available memory or optimizing applications." >> "$RECOMMENDATIONS"
fi

if grep -qi "disk full" "$LOG_DIR"/*.log 2>/dev/null; then
    echo "- Disk space issues detected. Clean up unnecessary files or increase disk space." >> "$RECOMMENDATIONS"
fi

echo "\n=========================================="
echo "Log analysis complete!"
echo "\nSummary:"
echo "- Logs collected in: $LOG_DIR"
echo "- Error summary: $ERROR_REPORT"
echo "- Recommendations: $RECOMMENDATIONS"
echo "\nNext steps:"
echo "1. Review the error summary report"
echo "2. Check specific container logs for detailed errors"
echo "3. Follow the recommendations provided"
echo "4. Monitor logs in real-time: docker logs -