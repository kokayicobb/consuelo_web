# Threads Agent Deployment Guide

This guide covers the complete deployment process for the Threads Agent Edge Function, including staging, production deployment, testing, and monitoring.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development](#local-development)
4. [Testing](#testing)
5. [Deployment Process](#deployment-process)
6. [Monitoring & Health Checks](#monitoring--health-checks)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)

## Prerequisites

### Required Tools

- **Node.js** (v22.0.0+)
- **Deno** (latest stable version)
- **Supabase CLI** (latest version)
- **Git** (for version control)
- **curl** (for testing and health checks)

### Installation Commands

```bash
# Install Supabase CLI
npm install -g supabase

# Install Deno
curl -fsSL https://deno.land/install.sh | sh

# Verify installations
supabase --version
deno --version
node --version
```

### Required Accounts & Keys

- **Supabase Project** (staging and production)
- **Threads API Access Token** (from Meta Developer Console)
- **Groq API Key** (from Groq Console)
- **GitHub Repository** (for CI/CD)

## Environment Setup

### Environment Variables

Create environment files for each environment:

#### `.env.staging`
```bash
# Supabase Configuration
SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key
SUPABASE_STAGING_PROJECT_REF=your_staging_project_ref

# Threads API
THREADS_ACCESS_TOKEN=your_threads_access_token
THREADS_USER_ID=your_threads_user_id
THREADS_USERNAME=your_threads_username

# AI Provider
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=deepseek-r1-distill-llama-70b
GROQ_MAX_TOKENS=150

# Features
AUTO_RESPONSE_ENABLED=true
ENABLE_DEBUG_LOGGING=true
ENVIRONMENT=staging
```

#### `.env.production`
```bash
# Supabase Configuration
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
SUPABASE_PROD_PROJECT_REF=your_production_project_ref

# Threads API
THREADS_ACCESS_TOKEN=your_threads_access_token
THREADS_USER_ID=your_threads_user_id
THREADS_USERNAME=your_threads_username

# AI Provider
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=deepseek-r1-distill-llama-70b
GROQ_MAX_TOKENS=150

# Features
AUTO_RESPONSE_ENABLED=true
ENABLE_DEBUG_LOGGING=false
ENVIRONMENT=production
```

### Supabase Secrets Management

Set secrets in your Supabase projects:

```bash
# For staging
supabase secrets set --project-ref your_staging_ref THREADS_ACCESS_TOKEN=your_token
supabase secrets set --project-ref your_staging_ref GROQ_API_KEY=your_key

# For production
supabase secrets set --project-ref your_production_ref THREADS_ACCESS_TOKEN=your_token
supabase secrets set --project-ref your_production_ref GROQ_API_KEY=your_key
```

## Local Development

### Start Local Supabase

```bash
# Start local Supabase services
npm run supabase:start

# Check status
npm run supabase:status

# Apply database migrations
npm run migrate
```

### Run Tests Locally

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:performance

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Local Function Development

```bash
# Serve functions locally
npm run functions:serve

# Serve specific function
npm run functions:serve:threads

# Test function locally
curl -X POST http://localhost:54321/functions/v1/threads-agent \
  -H "Content-Type: application/json" \
  -d '{"triggered_by": "manual_test"}'
```

## Testing

### Pre-Deployment Testing Strategy

Our testing pipeline includes multiple layers of validation:

#### 1. Unit Tests
```bash
# Test individual components
npm run test:unit

# Tests cover:
# - Database operations
# - API client functionality
# - AI response generation
# - Utility functions
```

#### 2. Integration Tests
```bash
# Test complete workflows
npm run test:integration

# Tests cover:
# - End-to-end mention processing
# - Database integration
# - API integration
# - Error handling scenarios
```

#### 3. Performance Tests
```bash
# Run performance benchmarks
npm run benchmark

# Tests cover:
# - Response time under load
# - Memory usage
# - Concurrent request handling
# - Database query performance
```

#### 4. Security Tests
```bash
# Run security scans
npm run security:scan

# Tests cover:
# - Input validation
# - Authentication checks
# - Data encryption
# - Rate limiting
```

### Test Data Management

Test data is automatically managed:

- **Setup**: Clean test database before each test suite
- **Isolation**: Each test uses unique identifiers
- **Cleanup**: Automatic cleanup after test completion
- **Mocking**: External APIs are mocked for consistent testing

## Deployment Process

### Deployment Script Usage

The deployment script (`supabase/functions/threads-agent/deploy.sh`) handles the complete deployment workflow:

```bash
# Basic usage
./deploy.sh [ENVIRONMENT] [FORCE_DEPLOY] [SKIP_TESTS] [DRY_RUN]

# Examples:
./deploy.sh                              # Deploy to staging with all checks
./deploy.sh production                   # Deploy to production (with confirmation)
./deploy.sh production true              # Deploy to production without confirmation
./deploy.sh staging false false true     # Dry run to staging
```

### Deployment Workflow

#### 1. Staging Deployment

```bash
# Deploy to staging
./supabase/functions/threads-agent/deploy.sh staging

# Or using npm script
npm run deploy:staging
```

**Staging Deployment Steps:**
1. ✅ Prerequisites check
2. ✅ Environment validation
3. ✅ Run all tests
4. ✅ Build function
5. ✅ Deploy to staging
6. ✅ Health verification
7. ✅ Integration testing

#### 2. Production Deployment

```bash
# Deploy to production (with confirmation)
./supabase/functions/threads-agent/deploy.sh production

# Force deploy (skip confirmation)
npm run deploy:prod
```

**Production Deployment Steps:**
1. ✅ Prerequisites check
2. ✅ Environment validation
3. ⚠️ Production confirmation prompt
4. ✅ Full test suite
5. ✅ Security scan
6. ✅ Build function
7. ✅ Deploy to production
8. ✅ Health verification
9. ✅ Smoke tests
10. ✅ Monitoring setup

### Blue-Green Deployment

For zero-downtime deployments, we use a blue-green strategy:

1. **Deploy to new instance** (Green)
2. **Run health checks** on Green
3. **Switch traffic** from Blue to Green
4. **Monitor** for issues
5. **Keep Blue** as rollback option

### Database Migrations

Migrations are handled separately and should be run before function deployment:

```bash
# Run migrations on staging
npm run migrate:staging

# Run migrations on production
npm run migrate:prod

# Check migration status
supabase db diff --linked
```

## Monitoring & Health Checks

### Health Check Endpoints

The function provides comprehensive health checking:

```bash
# Basic health check
curl https://your-project.supabase.co/functions/v1/threads-agent

# Detailed health check
curl -X POST https://your-project.supabase.co/functions/v1/threads-agent \
  -H "Content-Type: application/json" \
  -d '{"health_check": true}'
```

**Health Check Components:**
- ✅ Database connectivity
- ✅ Threads API availability
- ✅ AI API availability
- ✅ Memory usage
- ✅ Response time
- ✅ Service metadata

### Continuous Monitoring

#### 1. Automated Health Monitoring

```bash
# Continuous health monitoring
npm run monitor:health

# View function logs
npm run monitor:logs
```

#### 2. Performance Metrics

Key metrics to monitor:

- **Response Time**: < 10s average
- **Success Rate**: > 95%
- **Error Rate**: < 5%
- **Memory Usage**: < 75%
- **API Call Success**: > 90%

#### 3. Alerting Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Response Time | > 15s | > 30s |
| Error Rate | > 25% | > 50% |
| Memory Usage | > 75% | > 90% |
| Success Rate | < 75% | < 50% |

### Log Management

```bash
# View recent logs
supabase functions logs threads-agent

# Stream logs in real-time
supabase functions logs threads-agent --follow

# Filter logs by level
supabase functions logs threads-agent --level error
```

## Troubleshooting

### Common Issues

#### 1. Deployment Failures

**Issue**: Function deployment fails
```bash
# Check prerequisites
./deploy.sh --help

# Verify environment variables
echo $SUPABASE_PROD_PROJECT_REF

# Check Supabase CLI authentication
supabase auth status
```

**Issue**: Tests failing before deployment
```bash
# Run specific failing test
npm run test:unit -- --filter "specific-test-name"

# Check test environment
cat .env.test

# Reset test database
npm run supabase:reset
```

#### 2. Runtime Issues

**Issue**: Function returning errors
```bash
# Check function logs
supabase functions logs threads-agent --level error

# Test function directly
curl -X POST https://your-project.supabase.co/functions/v1/threads-agent \
  -H "Content-Type: application/json" \
  -d '{"triggered_by": "debug_test"}'

# Verify environment variables
supabase secrets list
```

**Issue**: Database connection failures
```bash
# Test database connectivity
supabase db test

# Check database status
supabase status

# Verify database migrations
supabase db diff
```

#### 3. API Integration Issues

**Issue**: Threads API errors
```bash
# Test Threads API directly
curl "https://graph.threads.net/v1.0/me?access_token=YOUR_TOKEN"

# Check token validity
# Verify in Meta Developer Console
```

**Issue**: AI API errors
```bash
# Test Groq API directly
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"

# Check API quota and rate limits
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set debug environment variable
supabase secrets set ENABLE_DEBUG_LOGGING=true

# Run with debug output
npm run test -- --debug

# View debug logs
supabase functions logs threads-agent --level debug
```

### Performance Debugging

```bash
# Run performance benchmarks
npm run benchmark

# Profile memory usage
npm run test:performance

# Check database query performance
npm run test:integration -- --profile
```

## Rollback Procedures

### Automatic Rollback

The deployment script includes automatic rollback on health check failure:

1. **Deploy new version**
2. **Run health checks**
3. **If health checks fail**:
   - Log rollback event
   - Notify administrators
   - Provide rollback instructions

### Manual Rollback

#### 1. Quick Rollback

```bash
# Redeploy previous known-good version
git checkout previous-stable-tag
./deploy.sh production true true  # Force deploy, skip tests

# Verify rollback
curl https://your-project.supabase.co/functions/v1/threads-agent
```

#### 2. Database Rollback

```bash
# If database migration rollback needed
supabase db reset --linked

# Restore from backup
supabase db dump --linked > backup.sql
# Apply backup to target environment
```

#### 3. Configuration Rollback

```bash
# Restore previous environment variables
supabase secrets set THREADS_ACCESS_TOKEN=previous_value
supabase secrets set GROQ_API_KEY=previous_value

# Restart function (happens automatically with secret updates)
```

### Post-Rollback Verification

After rollback:

1. ✅ **Health check** the rolled-back version
2. ✅ **Test critical functions** manually
3. ✅ **Monitor logs** for 30 minutes
4. ✅ **Verify metrics** return to normal
5. ✅ **Document incident** for post-mortem

## Best Practices

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security scan completed
- [ ] Staging deployment verified
- [ ] Rollback plan documented

### Post-Deployment Checklist

- [ ] Health checks passing
- [ ] Function responding correctly
- [ ] Logs showing normal operation
- [ ] Metrics within expected ranges
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment

### Security Considerations

- **API Keys**: Store in Supabase secrets, never in code
- **Rate Limiting**: Configure appropriate limits
- **Input Validation**: Validate all external inputs
- **Error Handling**: Don't expose sensitive information
- **Logging**: Log security events appropriately

### Performance Optimization

- **Caching**: Implement appropriate caching strategies
- **Database**: Optimize queries and use indexes
- **Rate Limiting**: Respect external API limits
- **Memory**: Monitor and optimize memory usage
- **Timeouts**: Set appropriate timeouts for external calls

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev                    # Start local development
npm test                       # Run all tests
npm run functions:serve        # Serve functions locally

# Deployment
npm run deploy:staging         # Deploy to staging
npm run deploy:prod           # Deploy to production
npm run deploy:check          # Pre-deployment checks

# Monitoring
npm run monitor:health        # Monitor health
npm run monitor:logs          # View logs
npm run benchmark            # Performance benchmarks

# Maintenance
npm run migrate              # Run database migrations
npm run security:scan        # Security scan
npm run docs:generate        # Generate documentation
```

### Support Contacts

- **Development Team**: [team-email]
- **DevOps**: [devops-email]
- **On-Call**: [oncall-email]
- **Emergency**: [emergency-contact]

For additional help, see [troubleshooting.md](./troubleshooting.md) or create an issue in the repository.