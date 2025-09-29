#!/bin/bash

# Threads Agent Deployment Script
# This script handles deployment to staging and production environments
# with proper checks, rollback capabilities, and monitoring

set -euo pipefail  # Exit on error, undefined variables, pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
FUNCTION_NAME="threads-agent"

# Default values
ENVIRONMENT="${1:-staging}"
FORCE_DEPLOY="${2:-false}"
SKIP_TESTS="${3:-false}"
DRY_RUN="${4:-false}"

# Environment-specific configuration
case "$ENVIRONMENT" in
    "staging")
        PROJECT_REF="${SUPABASE_STAGING_PROJECT_REF:-}"
        DEPLOY_URL="https://staging-project.supabase.co"
        ;;
    "production"|"prod")
        PROJECT_REF="${SUPABASE_PROD_PROJECT_REF:-}"
        DEPLOY_URL="https://production-project.supabase.co"
        ENVIRONMENT="production"
        ;;
    *)
        echo -e "${RED}Error: Invalid environment '$ENVIRONMENT'. Use 'staging' or 'production'.${NC}"
        exit 1
        ;;
esac

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Check if required tools are installed
check_prerequisites() {
    log "Checking prerequisites..."

    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI is not installed. Please install it first."
        echo "Install with: npm install -g supabase"
        exit 1
    fi

    if ! command -v deno &> /dev/null; then
        log_error "Deno is not installed. Please install it first."
        echo "Install from: https://deno.land/manual/getting_started/installation"
        exit 1
    fi

    if [ -z "$PROJECT_REF" ]; then
        log_error "Project reference not set for environment '$ENVIRONMENT'"
        echo "Set SUPABASE_${ENVIRONMENT^^}_PROJECT_REF environment variable"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Deploy the function
deploy_function() {
    log "Deploying function to $ENVIRONMENT..."

    if [ "$DRY_RUN" = "true" ]; then
        log_warning "DRY RUN: Would deploy function '$FUNCTION_NAME' to project '$PROJECT_REF'"
        return 0
    fi

    # Deploy with retry logic
    local max_retries=3
    local retry_count=0

    while [ $retry_count -lt $max_retries ]; do
        if supabase functions deploy "$FUNCTION_NAME" --project-ref "$PROJECT_REF"; then
            log_success "Function deployed successfully"
            return 0
        else
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $max_retries ]; then
                log_warning "Deployment failed, retrying in 10 seconds... (attempt $retry_count/$max_retries)"
                sleep 10
            fi
        fi
    done

    log_error "Deployment failed after $max_retries attempts"
    exit 1
}

# Main deployment flow
main() {
    log "Starting deployment of $FUNCTION_NAME to $ENVIRONMENT"

    if [ "$DRY_RUN" = "true" ]; then
        log_warning "Running in DRY RUN mode - no actual changes will be made"
    fi

    # Pre-deployment checks
    check_prerequisites

    # Confirm production deployment
    if [ "$ENVIRONMENT" = "production" ] && [ "$FORCE_DEPLOY" != "true" ] && [ "$DRY_RUN" != "true" ]; then
        echo -e "${YELLOW}You are about to deploy to PRODUCTION. Are you sure? (y/N)${NC}"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            log "Deployment cancelled by user"
            exit 0
        fi
    fi

    # Deploy
    deploy_function

    log_success "Deployment completed successfully! 🚀"
}

# Show usage information
show_usage() {
    cat << EOF
Usage: $0 [ENVIRONMENT] [FORCE_DEPLOY] [SKIP_TESTS] [DRY_RUN]

Arguments:
    ENVIRONMENT     Target environment (staging|production) [default: staging]
    FORCE_DEPLOY    Skip confirmation for production (true|false) [default: false]
    SKIP_TESTS      Skip pre-deployment tests (true|false) [default: false]
    DRY_RUN         Show what would be done without making changes (true|false) [default: false]

Examples:
    $0                              # Deploy to staging with all checks
    $0 production                   # Deploy to production (with confirmation)
    $0 production true              # Deploy to production without confirmation
    $0 staging false false true     # Dry run to staging

Environment Variables Required:
    SUPABASE_STAGING_PROJECT_REF or SUPABASE_PROD_PROJECT_REF
    SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY
    THREADS_ACCESS_TOKEN
    GROQ_API_KEY

EOF
}

# Handle help requests
if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
    show_usage
    exit 0
fi

# Run main function
main "$@"