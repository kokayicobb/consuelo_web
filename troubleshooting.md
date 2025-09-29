# Troubleshooting Guide

This comprehensive troubleshooting guide helps resolve common issues with the Threads Agent Edge Function deployment, testing, and operation.

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Deployment Issues](#deployment-issues)
3. [Runtime Issues](#runtime-issues)
4. [API Integration Issues](#api-integration-issues)
5. [Database Issues](#database-issues)
6. [Performance Issues](#performance-issues)
7. [Testing Issues](#testing-issues)
8. [Security Issues](#security-issues)
9. [Monitoring Issues](#monitoring-issues)
10. [Emergency Procedures](#emergency-procedures)

## Quick Diagnostics

### Health Check Commands

```bash
# Quick health check
curl -f https://your-project.supabase.co/functions/v1/threads-agent

# Detailed health check
curl -X POST https://your-project.supabase.co/functions/v1/threads-agent \
  -H "Content-Type: application/json" \
  -d '{"health_check": true}' | jq '.'

# Check function status
supabase functions list

# View recent logs
supabase functions logs threads-agent --limit 50
```

### Environment Validation

```bash
# Check environment variables
echo "SUPABASE_URL: $SUPABASE_URL"
echo "PROJECT_REF: $SUPABASE_PROD_PROJECT_REF"

# Test Supabase connection
supabase status

# Verify secrets
supabase secrets list --project-ref $SUPABASE_PROD_PROJECT_REF
```

### System Status Dashboard

```sql
-- Quick system status query
SELECT
  'processed_mentions' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as last_hour,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_records
FROM processed_mentions
UNION ALL
SELECT
  'analytics' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as last_hour,
  COUNT(*) FILTER (WHERE success = false) as failed_records
FROM analytics;
```

## Deployment Issues

### Issue: Function Deployment Fails

#### Symptoms
- `supabase functions deploy` returns error
- Function not appearing in Supabase dashboard
- Deployment script exits with non-zero code

#### Diagnostic Steps
```bash
# Check Supabase CLI version
supabase --version

# Verify authentication
supabase auth status

# Check project reference
echo $SUPABASE_PROD_PROJECT_REF

# Test TypeScript compilation
cd supabase/functions/threads-agent
deno check index.ts
```

#### Common Causes & Solutions

**1. Authentication Issues**
```bash
# Re-authenticate with Supabase
supabase auth login

# Verify project access
supabase projects list
```

**2. TypeScript Compilation Errors**
```bash
# Check for syntax errors
deno check index.ts

# Fix import paths
deno info index.ts

# Check for missing dependencies
grep -r "import.*from" *.ts
```

**3. Environment Variable Issues**
```bash
# Verify required environment variables
./deploy.sh --help

# Set missing variables
export SUPABASE_PROD_PROJECT_REF=your_project_ref

# Check .env files
cat .env.production
```

**4. Network/Connectivity Issues**
```bash
# Test Supabase API connectivity
curl -H "Authorization: Bearer $(supabase auth token)" \
  https://api.supabase.com/v1/projects

# Check firewall/proxy settings
curl -v https://supabase.com
```

### Issue: Deployment Succeeds but Function Not Working

#### Symptoms
- Deployment completes successfully
- Function returns 500 errors
- Health check fails

#### Diagnostic Steps
```bash
# Check function logs immediately after deployment
supabase functions logs threads-agent --level error

# Test function invocation
supabase functions invoke threads-agent \
  --method POST \
  --data '{"triggered_by": "test"}'

# Verify secrets are set
supabase secrets list
```

#### Solutions
```bash
# Set missing secrets
supabase secrets set THREADS_ACCESS_TOKEN=your_token
supabase secrets set GROQ_API_KEY=your_key

# Check database connectivity
supabase db test

# Verify migrations are applied
supabase db diff
```

## Runtime Issues

### Issue: Function Timeout Errors

#### Symptoms
- 504 Gateway Timeout errors
- Functions stopping mid-execution
- Long processing times

#### Diagnostic Steps
```bash
# Check function execution duration
supabase functions logs threads-agent | grep "duration"

# Monitor memory usage
supabase functions logs threads-agent | grep "memory"

# Check for infinite loops
supabase functions logs threads-agent | grep -A5 -B5 "timeout"
```

#### Solutions

**1. Optimize Database Queries**
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_processed_mentions_created_at
ON processed_mentions(created_at);
```

**2. Reduce API Call Delays**
```typescript
// Reduce delay between API calls
const delayMs = parseInt(await db.getConfigValue('response_delay_seconds') || '0.5') * 1000;

// Implement timeout for API calls
const controller = new AbortController();
setTimeout(() => controller.abort(), 10000); // 10 second timeout

const response = await fetch(url, {
  signal: controller.signal
});
```

**3. Batch Process Large Operations**
```typescript
// Process mentions in smaller batches
const batchSize = 10;
for (let i = 0; i < mentions.length; i += batchSize) {
  const batch = mentions.slice(i, i + batchSize);
  await processBatch(batch);

  // Allow other operations to run
  await new Promise(resolve => setTimeout(resolve, 100));
}
```

### Issue: Memory Leaks

#### Symptoms
- Function crashes with memory errors
- Performance degrades over time
- High memory usage in health checks

#### Diagnostic Steps
```typescript
// Add memory monitoring
const logMemoryUsage = () => {
  const usage = Deno.memoryUsage();
  console.log('Memory:', {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB'
  });
};

// Call at critical points
logMemoryUsage();
await processLargeDataset();
logMemoryUsage();
```

#### Solutions

**1. Clear Large Objects**
```typescript
// Clear references to large objects
let largeData = await fetchLargeDataset();
// Use largeData...
largeData = null; // Clear reference

// Use WeakMap for caches
const cache = new WeakMap();
```

**2. Stream Large Operations**
```typescript
// Stream database results instead of loading all at once
const { data, error } = await supabase
  .from('processed_mentions')
  .select('*')
  .range(0, 100); // Paginate results
```

## API Integration Issues

### Issue: Threads API Failures

#### Symptoms
- 401 Unauthorized errors
- 429 Rate limit errors
- API calls timing out

#### Diagnostic Steps
```bash
# Test Threads API directly
curl -v "https://graph.threads.net/v1.0/me?access_token=YOUR_TOKEN"

# Check token validity
curl "https://graph.threads.net/v1.0/me?fields=id,username&access_token=YOUR_TOKEN"

# Monitor rate limiting
supabase functions logs threads-agent | grep "rate limit"
```

#### Solutions

**1. Authentication Issues**
```bash
# Generate new access token
# Go to Meta Developer Console > Your App > Threads API

# Update token in secrets
supabase secrets set THREADS_ACCESS_TOKEN=new_token

# Verify token works
curl "https://graph.threads.net/v1.0/me?access_token=NEW_TOKEN"
```

**2. Rate Limiting**
```typescript
// Implement exponential backoff
async function callThreadsApiWithRetry(url: string, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url);

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '60');
        console.log(`Rate limited, waiting ${retryAfter}s`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }

      return response;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}
```

**3. API Quota Issues**
```sql
-- Track API usage
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as api_calls,
  SUM(CASE WHEN success THEN 0 ELSE 1 END) as failed_calls
FROM analytics
WHERE event_type = 'api_call'
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour;
```

### Issue: AI API (Groq) Failures

#### Symptoms
- AI responses not generating
- Error messages about API limits
- Slow AI response times

#### Diagnostic Steps
```bash
# Test Groq API directly
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"

# Check API quota
curl https://api.groq.com/openai/v1/usage \
  -H "Authorization: Bearer YOUR_API_KEY"

# Monitor AI response times
supabase functions logs threads-agent | grep "AI generation"
```

#### Solutions

**1. API Key Issues**
```bash
# Generate new API key from Groq Console
# Update in secrets
supabase secrets set GROQ_API_KEY=new_key

# Test new key
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer NEW_KEY"
```

**2. Optimize AI Requests**
```typescript
// Reduce token usage
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'deepseek-r1-distill-llama-70b',
    messages: [
      { role: 'system', content: 'Be concise.' }, // Shorter system prompt
      { role: 'user', content: userPrompt.substring(0, 500) } // Limit input length
    ],
    temperature: 0.7,
    max_tokens: 100 // Reduce max tokens
  })
});
```

## Database Issues

### Issue: Database Connection Failures

#### Symptoms
- "Connection refused" errors
- Database timeouts
- Transaction failures

#### Diagnostic Steps
```bash
# Test database connectivity
supabase db test

# Check database status
supabase status

# Monitor connection pool
supabase functions logs threads-agent | grep "database"
```

#### Solutions

**1. Connection Pool Issues**
```typescript
// Use connection pooling
const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    db: {
      schema: 'public'
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

**2. Long-Running Transactions**
```sql
-- Check for long-running queries
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Kill long-running queries if needed
SELECT pg_terminate_backend(pid);
```

### Issue: Migration Failures

#### Symptoms
- Migration scripts failing
- Schema out of sync
- Missing tables or columns

#### Diagnostic Steps
```bash
# Check migration status
supabase db diff

# List applied migrations
supabase migration list

# Check for conflicts
supabase db reset --linked
```

#### Solutions
```bash
# Apply missing migrations
supabase db push

# Reset and reapply all migrations
supabase db reset
supabase db push

# Fix migration conflicts manually
supabase migration new fix_schema_conflict
# Edit the new migration file
supabase db push
```

## Performance Issues

### Issue: Slow Response Times

#### Symptoms
- Function taking > 30 seconds
- Timeouts in health checks
- Users reporting slow responses

#### Diagnostic Steps
```bash
# Profile function execution
npm run benchmark

# Check database query performance
supabase functions logs threads-agent | grep "duration"

# Monitor external API response times
supabase functions logs threads-agent | grep "API.*took"
```

#### Solutions

**1. Database Optimization**
```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_processed_mentions_mention_id
ON processed_mentions(mention_id);

CREATE INDEX CONCURRENTLY idx_analytics_created_at
ON analytics(created_at) WHERE event_type = 'mention_processed';

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM processed_mentions WHERE mention_id = 'test';
```

**2. Caching Implementation**
```typescript
// Implement in-memory caching
const cache = new Map();

async function getCachedConfig(key: string): Promise<string | null> {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const value = await db.getConfigValue(key);
  cache.set(key, value);

  // Cache for 5 minutes
  setTimeout(() => cache.delete(key), 5 * 60 * 1000);

  return value;
}
```

**3. Parallel Processing**
```typescript
// Process mentions in parallel
const results = await Promise.allSettled(
  mentions.map(mention => processMention(mention))
);

// Handle results
results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    console.log(`Mention ${index} processed successfully`);
  } else {
    console.error(`Mention ${index} failed:`, result.reason);
  }
});
```

### Issue: High Memory Usage

#### Symptoms
- Memory warnings in health checks
- Function crashes with memory errors
- Gradual performance degradation

#### Solutions
```typescript
// Monitor memory usage
function checkMemoryUsage() {
  const usage = Deno.memoryUsage();
  const usedMB = usage.heapUsed / 1024 / 1024;

  if (usedMB > 100) { // Alert if using > 100MB
    console.warn(`High memory usage: ${usedMB.toFixed(2)}MB`);
  }
}

// Implement memory-efficient processing
async function processInBatches<T>(items: T[], batchSize: number, processor: (item: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(processor));

    // Force garbage collection hint
    if (typeof globalThis.gc === 'function') {
      globalThis.gc();
    }
  }
}
```

## Testing Issues

### Issue: Tests Failing

#### Symptoms
- Unit tests failing unexpectedly
- Integration tests timing out
- Mock data issues

#### Diagnostic Steps
```bash
# Run specific failing test
deno test --allow-all --filter "specific test name" tests/

# Run tests with verbose output
deno test --allow-all -v tests/

# Check test database state
npm run test:unit -- --inspect
```

#### Solutions

**1. Test Environment Issues**
```bash
# Reset test environment
npm run supabase:reset

# Check test environment variables
cat .env.test

# Clear test data
npm run test:cleanup
```

**2. Mock Configuration Issues**
```typescript
// Ensure mocks are properly configured
beforeEach(() => {
  // Reset mocks
  threadsApiMock = ThreadsApiMock.createSuccessScenario();
  groqApiMock = GroqApiMock.createSuccessScenario();

  // Configure global fetch
  globalThis.fetch = createCombinedMock(threadsApiMock, groqApiMock);
});

afterEach(() => {
  // Restore original fetch
  globalThis.fetch = originalFetch;
});
```

### Issue: Flaky Tests

#### Symptoms
- Tests pass sometimes, fail other times
- Race conditions in async tests
- Timing-dependent failures

#### Solutions
```typescript
// Add proper wait conditions
async function waitForCondition(condition: () => boolean, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (condition()) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Condition not met within timeout');
}

// Use in tests
await waitForCondition(() => mockApi.callCount > 0);
```

## Security Issues

### Issue: Authentication Failures

#### Symptoms
- 401 Unauthorized errors
- API key validation failures
- Access denied errors

#### Diagnostic Steps
```bash
# Check API key format
echo $THREADS_ACCESS_TOKEN | wc -c

# Test API key directly
curl "https://graph.threads.net/v1.0/me?access_token=$THREADS_ACCESS_TOKEN"

# Verify secrets in Supabase
supabase secrets list
```

#### Solutions
```bash
# Regenerate API keys
# 1. Go to Meta Developer Console
# 2. Generate new Threads access token
# 3. Update in Supabase secrets

supabase secrets set THREADS_ACCESS_TOKEN=new_token

# Restart function (automatic with secret update)
```

### Issue: Rate Limiting Problems

#### Symptoms
- 429 Too Many Requests
- API calls being rejected
- Function being throttled

#### Solutions
```typescript
// Implement proper rate limiting
class RateLimiter {
  private calls: number[] = [];

  constructor(
    private maxCalls: number,
    private windowMs: number
  ) {}

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.windowMs);

    if (this.calls.length >= this.maxCalls) {
      const oldestCall = Math.min(...this.calls);
      const waitTime = this.windowMs - (now - oldestCall);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.calls.push(now);
  }
}

// Use rate limiter
const rateLimiter = new RateLimiter(100, 60000); // 100 calls per minute
await rateLimiter.waitIfNeeded();
```

## Monitoring Issues

### Issue: Health Checks Failing

#### Symptoms
- Health endpoint returning errors
- Monitoring alerts triggering
- Service showing as unhealthy

#### Diagnostic Steps
```bash
# Test health endpoint manually
curl -v https://your-project.supabase.co/functions/v1/threads-agent

# Check individual health components
curl -X POST https://your-project.supabase.co/functions/v1/threads-agent \
  -H "Content-Type: application/json" \
  -d '{"health_check": true}' | jq '.checks'
```

#### Solutions
```bash
# Check each component individually

# 1. Database health
supabase db test

# 2. API connectivity
curl "https://graph.threads.net/v1.0/me?access_token=$THREADS_ACCESS_TOKEN"
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer $GROQ_API_KEY"

# 3. Function logs for specific errors
supabase functions logs threads-agent --level error
```

### Issue: Missing Metrics

#### Symptoms
- No metrics in dashboard
- Analytics table empty
- Monitoring gaps

#### Solutions
```sql
-- Check if analytics function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'log_analytics_event';

-- Manually insert test analytics event
SELECT log_analytics_event(
  'test_event',
  'test_run',
  'testing',
  'system',
  '{"test": true}'::jsonb,
  '{"source": "manual"}'::jsonb,
  true
);

-- Verify analytics data
SELECT * FROM analytics ORDER BY created_at DESC LIMIT 5;
```

## Emergency Procedures

### Emergency Rollback

When critical issues occur in production:

```bash
# 1. Immediate rollback to last known good version
git log --oneline -10  # Find last good commit
git checkout LAST_GOOD_COMMIT

# 2. Emergency deployment (skip tests if necessary)
./deploy.sh production true true  # force, skip tests

# 3. Verify rollback worked
curl -f https://your-project.supabase.co/functions/v1/threads-agent

# 4. Monitor for 15 minutes
supabase functions logs threads-agent --follow
```

### Service Degradation Response

When service is degraded but functional:

```bash
# 1. Enable debug logging
supabase secrets set ENABLE_DEBUG_LOGGING=true

# 2. Reduce processing frequency
supabase secrets set RESPONSE_DELAY_SECONDS=5

# 3. Monitor key metrics
watch -n 30 'curl -s https://your-project.supabase.co/functions/v1/threads-agent | jq ".status"'

# 4. Prepare for rollback if needed
git log --oneline -5
```

### Communication Template

For incident communication:

```
🚨 INCIDENT: Threads Agent Service Issue

Status: [INVESTIGATING|DEGRADED|RESOLVED]
Start Time: [TIMESTAMP]
Impact: [DESCRIPTION]

Current Actions:
- [ACTION 1]
- [ACTION 2]

Next Update: [TIMESTAMP]

Contact: [ENGINEER] for updates
```

---

## Quick Reference

### Emergency Commands
```bash
# Health check
curl -f https://your-project.supabase.co/functions/v1/threads-agent

# View errors
supabase functions logs threads-agent --level error --limit 20

# Emergency rollback
git checkout LAST_GOOD_COMMIT && ./deploy.sh production true true

# Test APIs
curl "https://graph.threads.net/v1.0/me?access_token=$THREADS_ACCESS_TOKEN"
curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"
```

### Support Contacts
- **On-Call Engineer**: [contact-info]
- **Team Lead**: [contact-info]
- **Infrastructure**: [contact-info]

### Escalation Matrix
1. **Level 1**: Engineer investigates (0-30 min)
2. **Level 2**: Team lead involved (30-60 min)
3. **Level 3**: Infrastructure team engaged (60+ min)

For additional help, refer to the [deployment guide](deployment.md) and [monitoring guide](monitoring.md).