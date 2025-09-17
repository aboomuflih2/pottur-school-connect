#!/bin/bash

# Production Build Script for Pottur School Connect
# This script handles the complete production build process with optimizations

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Pottur School Connect"
BUILD_DIR="dist"
LOG_FILE="build-$(date +%Y%m%d-%H%M%S).log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

check_dependencies() {
    log "Checking dependencies..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_NODE="18.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE" ]; then
        log_error "Node.js version $NODE_VERSION is too old. Required: $REQUIRED_NODE+"
        exit 1
    fi
    
    log_success "Node.js version $NODE_VERSION is compatible"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    log_success "npm is available"
}

check_environment() {
    log "Checking environment configuration..."
    
    # Check if production environment file exists
    if [ ! -f ".env.production" ]; then
        log_error ".env.production file not found"
        exit 1
    fi
    
    # Check required environment variables
    REQUIRED_VARS=("VITE_SUPABASE_URL" "VITE_SUPABASE_PUBLISHABLE_KEY" "VITE_APP_DOMAIN")
    
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^$var=" .env.production; then
            log_error "Required environment variable $var not found in .env.production"
            exit 1
        fi
    done
    
    log_success "Environment configuration is valid"
}

install_dependencies() {
    log "Installing dependencies..."
    
    # Clean install
    if [ -d "node_modules" ]; then
        log "Cleaning existing node_modules..."
        rm -rf node_modules
    fi
    
    if [ -f "package-lock.json" ]; then
        npm ci --production=false
    else
        npm install
    fi
    
    log_success "Dependencies installed successfully"
}

run_quality_checks() {
    log "Running quality checks..."
    
    # Type checking
    log "Running TypeScript type checking..."
    npm run type-check
    log_success "Type checking passed"
    
    # Linting
    log "Running ESLint..."
    npm run lint
    log_success "Linting passed"
}

clean_build_directory() {
    log "Cleaning build directory..."
    
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        log_success "Build directory cleaned"
    fi
}

build_application() {
    log "Building application for production..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Build the application
    npm run build:prod
    
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build failed - $BUILD_DIR directory not created"
        exit 1
    fi
    
    log_success "Application built successfully"
}

optimize_build() {
    log "Optimizing build..."
    
    # Check build size
    BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
    log "Build size: $BUILD_SIZE"
    
    # Count files
    FILE_COUNT=$(find "$BUILD_DIR" -type f | wc -l)
    log "Total files: $FILE_COUNT"
    
    # Check for large files
    log "Checking for large files (>1MB)..."
    LARGE_FILES=$(find "$BUILD_DIR" -type f -size +1M)
    
    if [ -n "$LARGE_FILES" ]; then
        log_warning "Large files found:"
        echo "$LARGE_FILES" | while read -r file; do
            SIZE=$(du -h "$file" | cut -f1)
            log_warning "  $file ($SIZE)"
        done
    else
        log_success "No large files found"
    fi
    
    # Generate build report
    generate_build_report
}

generate_build_report() {
    log "Generating build report..."
    
    REPORT_FILE="build-report-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$REPORT_FILE" << EOF
{
  "project": "$PROJECT_NAME",
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "buildSize": "$(du -sb "$BUILD_DIR" | cut -f1)",
  "buildSizeHuman": "$(du -sh "$BUILD_DIR" | cut -f1)",
  "fileCount": $(find "$BUILD_DIR" -type f | wc -l),
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
}
EOF
    
    log_success "Build report generated: $REPORT_FILE"
}

run_build_tests() {
    log "Running build tests..."
    
    # Check if index.html exists
    if [ ! -f "$BUILD_DIR/index.html" ]; then
        log_error "index.html not found in build directory"
        exit 1
    fi
    
    # Check if assets directory exists
    if [ ! -d "$BUILD_DIR/assets" ]; then
        log_error "assets directory not found in build directory"
        exit 1
    fi
    
    # Check for JavaScript files
    JS_FILES=$(find "$BUILD_DIR" -name "*.js" | wc -l)
    if [ "$JS_FILES" -eq 0 ]; then
        log_error "No JavaScript files found in build"
        exit 1
    fi
    
    # Check for CSS files
    CSS_FILES=$(find "$BUILD_DIR" -name "*.css" | wc -l)
    if [ "$CSS_FILES" -eq 0 ]; then
        log_warning "No CSS files found in build"
    fi
    
    log_success "Build tests passed"
}

package_build() {
    log "Packaging build for deployment..."
    
    PACKAGE_NAME="pottur-school-connect-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    tar -czf "$PACKAGE_NAME" -C "$BUILD_DIR" .
    
    PACKAGE_SIZE=$(du -h "$PACKAGE_NAME" | cut -f1)
    log_success "Build packaged: $PACKAGE_NAME ($PACKAGE_SIZE)"
}

show_summary() {
    log_success "=== BUILD SUMMARY ==="
    log_success "Project: $PROJECT_NAME"
    log_success "Build completed at: $(date)"
    log_success "Build directory: $BUILD_DIR"
    log_success "Build size: $(du -sh "$BUILD_DIR" | cut -f1)"
    log_success "Log file: $LOG_FILE"
    
    if [ -f "$PACKAGE_NAME" ]; then
        log_success "Package: $PACKAGE_NAME"
    fi
    
    log_success "=== NEXT STEPS ==="
    log "1. Test the build locally: npm run preview:prod"
    log "2. Deploy using Docker: npm run docker:build && npm run docker:run"
    log "3. Deploy to VPS: Follow VPS_DEPLOYMENT_GUIDE.md"
}

# Main execution
main() {
    log "Starting production build for $PROJECT_NAME"
    
    # Parse command line arguments
    SKIP_DEPS=false
    SKIP_TESTS=false
    PACKAGE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-deps)
                SKIP_DEPS=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --package)
                PACKAGE=true
                shift
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  --skip-deps    Skip dependency installation"
                echo "  --skip-tests   Skip quality checks"
                echo "  --package      Create deployment package"
                echo "  --help         Show this help"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Execute build steps
    check_dependencies
    check_environment
    
    if [ "$SKIP_DEPS" = false ]; then
        install_dependencies
    fi
    
    if [ "$SKIP_TESTS" = false ]; then
        run_quality_checks
    fi
    
    clean_build_directory
    build_application
    optimize_build
    run_build_tests
    
    if [ "$PACKAGE" = true ]; then
        package_build
    fi
    
    show_summary
    
    log_success "Production build completed successfully!"
}

# Error handling
trap 'log_error "Build failed at line $LINENO"' ERR

# Run main function
main "$@"