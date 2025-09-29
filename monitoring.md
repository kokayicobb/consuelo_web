# Monitoring and Alerting Guide

This guide covers the comprehensive monitoring, alerting, and observability setup for the Threads Agent Edge Function.

## Table of Contents

1. [Monitoring Overview](#monitoring-overview)
2. [Health Checks](#health-checks)
3. [Metrics Collection](#metrics-collection)
4. [Alerting Configuration](#alerting-configuration)
5. [Log Management](#log-management)
6. [Performance Monitoring](#performance-monitoring)
7. [Error Tracking](#error-tracking)
8. [Dashboard Setup](#dashboard-setup)
9. [Troubleshooting](#troubleshooting)

## Monitoring Overview

Our monitoring strategy provides comprehensive observability across:

- **Health Status**: Real-time service health
- **Performance Metrics**: Response times, throughput, errors
- **Business Metrics**: Mentions processed, success rates
- **Infrastructure Metrics**: Memory, CPU, database performance
- **Security Events**: Authentication failures, rate limiting

### Monitoring Stack

- **Health Checks**: Built-in endpoint monitoring
- **Metrics**: Custom metrics collection in Supabase
- **Logs**: Supabase function logs with structured logging
- **Alerts**: Webhook-based alerting system
- **Dashboards**: Supabase dashboard + custom views

## Health Checks

### Health Check Endpoint

The function provides a comprehensive health check endpoint:

```bash
# Basic health check (GET request)
curl https://your-project.supabase.co/functions/v1/threads-agent

# Detailed health check (POST request)
curl -X POST https://your-project.supabase.co/functions/v1/threads-agent \
  -H "Content-Type: application/json" \
  -d '{"health_check": true}'
```

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "threads-agent",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "pass",
      "message": "Database connection healthy",
      "responseTime": 45
    },
    "threadsApi": {
      "status": "pass",
      "message": "Threads API healthy",
      "responseTime": 120
    },
    "aiApi": {
      "status": "pass",
      "message": "AI API healthy",
      "responseTime": 200
    },
    "memory": {
      "status": "pass",
      "message": "Memory usage normal: 32.5%",
      "details": {
        "heapUsedMB": 25.6,
        "heapTotalMB": 78.9,
        "usagePercent": 32.5
      }
    },
    "responseTime": {
      "status": "pass",
      "message": "Health check responsive: 89ms",
      "responseTime": 89
    }
  },
  "metadata": {
    "uptime": 3600000,
    "lastProcessed": "2024-01-15T10:25:00Z",
    "totalProcessed": 156,
    "errorRate": 2.3
  }
}
```

### Health Status Levels

- **Healthy**: All checks passing
- **Degraded**: Some warnings but service operational
- **Unhealthy**: Critical issues affecting service

### Automated Health Monitoring

```bash
# Continuous health monitoring script
npm run monitor:health

# Manual health check
curl -f https://your-project.supabase.co/functions/v1/threads-agent || echo "Health check failed"
```

## Metrics Collection

### Built-in Metrics

The function automatically collects:

#### Function Metrics
- **Invocations**: Total function calls
- **Success Rate**: Percentage of successful executions
- **Error Rate**: Percentage of failed executions
- **Response Time**: Average execution time
- **Memory Usage**: Peak memory consumption

#### Business Metrics
- **Mentions Found**: Total mentions discovered
- **Mentions Processed**: Successfully processed mentions
- **Responses Posted**: Successfully posted responses
- **Processing Time**: Time to process each mention
- **API Call Success**: External API success rates

### Custom Metrics Collection

```typescript
// Example metrics collection in function
import { MetricsCollector } from "./monitoring.ts";

const collector = new MetricsCollector(supabase);

// Collect metrics for the last hour
const metrics = await collector.collectMetrics("threads-agent", "production");

console.log("Metrics:", {
  invocations: metrics.metrics.invocations,
  successRate: metrics.metrics.successRate,
  averageResponseTime: metrics.metrics.averageResponseTime,
  errorRate: metrics.metrics.errorRate
});
```

### Metrics Storage

Metrics are stored in the `analytics` table:

```sql
-- View recent metrics
SELECT
  event_name,
  event_data,
  success,
  created_at
FROM analytics
WHERE event_type = 'mention_processed'
ORDER BY created_at DESC
LIMIT 10;

-- Calculate success rate over last 24 hours
SELECT
  COUNT(*) as total_runs,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_runs,
  AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) * 100 as success_rate
FROM analytics
WHERE event_type = 'mention_processed'
  AND created_at >= NOW() - INTERVAL '24 hours';
```

## Alerting Configuration

### Alert Manager Setup

```typescript
import { AlertManager } from "./monitoring.ts";

// Initialize with webhook URL
const alertManager = new AlertManager("https://your-webhook-url.com/alerts");

// Evaluate health and send alerts
const healthCheck = await healthMonitor.performHealthCheck();
await alertManager.evaluateHealthAndAlert(healthCheck);

// Evaluate metrics and send alerts
const metrics = await metricsCollector.collectMetrics("threads-agent", "production");
await alertManager.evaluateMetricsAndAlert(metrics);
```

### Alert Thresholds

#### Critical Alerts (Immediate Response)

| Metric | Threshold | Action |
|--------|-----------|---------|
| Service Status | Unhealthy | Page on-call engineer |
| Error Rate | > 50% | Page on-call engineer |
| Response Time | > 30s | Page on-call engineer |
| Memory Usage | > 90% | Page on-call engineer |
| Success Rate | < 50% | Page on-call engineer |

#### Warning Alerts (Review Required)

| Metric | Threshold | Action |
|--------|-----------|---------|
| Service Status | Degraded | Notify team |
| Error Rate | > 25% | Notify team |
| Response Time | > 15s | Notify team |
| Memory Usage | > 75% | Notify team |
| Success Rate | < 75% | Notify team |

### Webhook Alert Format

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "threads-agent",
  "severity": "critical",
  "message": "High error rate: 65.2%",
  "details": {
    "errorRate": 65.2,
    "totalRequests": 150,
    "failedRequests": 98,
    "environment": "production"
  }
}
```

### Alert Channels

Configure multiple notification channels:

```bash
# Slack webhook
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Email notifications
ALERT_EMAIL_WEBHOOK=https://your-email-service.com/webhook

# PagerDuty integration
PAGERDUTY_WEBHOOK=https://events.pagerduty.com/integration/YOUR_KEY/enqueue
```

## Log Management

### Structured Logging

The function uses structured logging for better observability:

```typescript
// Structured log entry
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: "info",
  service: "threads-agent",
  operation: "process_mentions",
  mentionId: "mention-123",
  duration: 1250,
  success: true,
  metadata: {
    username: "testuser",
    responseLength: 156
  }
}));
```

### Log Levels

- **DEBUG**: Detailed debugging information
- **INFO**: General operational messages
- **WARN**: Warning conditions
- **ERROR**: Error conditions requiring attention
- **FATAL**: Critical errors causing service failure

### Viewing Logs

```bash
# View recent logs
supabase functions logs threads-agent

# Stream logs in real-time
supabase functions logs threads-agent --follow

# Filter by log level
supabase functions logs threads-agent --level error

# Search logs
supabase functions logs threads-agent | grep "mention_id"
```

### Log Retention

- **Development**: 7 days
- **Staging**: 30 days
- **Production**: 90 days

### Log Analysis Queries

```bash
# Count errors by type
supabase functions logs threads-agent --level error | grep -o '"error":"[^"]*"' | sort | uniq -c

# Find slow operations
supabase functions logs threads-agent | grep "duration" | awk '{print $NF}' | sort -n | tail -10

# Monitor API failures
supabase functions logs threads-agent | grep "API error" | tail -20
```

## Performance Monitoring

### Key Performance Indicators (KPIs)

#### Response Time Percentiles
- **P50**: < 5 seconds
- **P95**: < 15 seconds
- **P99**: < 30 seconds

#### Throughput Metrics
- **Mentions/Hour**: Target processing rate
- **API Calls/Second**: External API usage
- **Database Queries/Second**: Database load

### Performance Benchmarking

```bash
# Run performance benchmarks
npm run benchmark

# Continuous performance monitoring
npm run test:performance

# Load testing (external tool)
./scripts/load-test.sh production 100 concurrent-users
```

### Performance Alerts

```typescript
// Performance-based alerting
if (metrics.averageResponseTime > 15000) {
  await alertManager.sendAlert('warning',
    `Elevated response times: ${metrics.averageResponseTime}ms average`);
}

if (metrics.averageResponseTime > 30000) {
  await alertManager.sendAlert('critical',
    `Slow response times: ${metrics.averageResponseTime}ms average`);
}
```

## Error Tracking

### Error Categories

1. **API Errors**: External API failures
2. **Database Errors**: Database connectivity/query issues
3. **Validation Errors**: Input validation failures
4. **Rate Limit Errors**: API rate limiting
5. **Timeout Errors**: Operation timeouts

### Error Metrics Collection

```sql
-- Error rate by category
SELECT
  error_category,
  COUNT(*) as error_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as error_percentage
FROM (
  SELECT
    CASE
      WHEN error_message LIKE '%rate limit%' THEN 'rate_limit'
      WHEN error_message LIKE '%timeout%' THEN 'timeout'
      WHEN error_message LIKE '%API%' THEN 'api_error'
      WHEN error_message LIKE '%database%' THEN 'database_error'
      ELSE 'unknown'
    END as error_category
  FROM processed_mentions
  WHERE status = 'failed'
    AND created_at >= NOW() - INTERVAL '24 hours'
) categorized_errors
GROUP BY error_category
ORDER BY error_count DESC;
```

### Error Analysis Dashboard

```sql
-- Recent errors with context
SELECT
  mention_id,
  username,
  error_message,
  created_at,
  retry_count
FROM processed_mentions
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 50;

-- Error trends over time
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as total_mentions,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_mentions,
  AVG(CASE WHEN status = 'failed' THEN 1.0 ELSE 0.0 END) * 100 as error_rate
FROM processed_mentions
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour;
```

## Dashboard Setup

### Supabase Dashboard Metrics

Access the Supabase dashboard to view:

1. **Function Invocations**: Total calls over time
2. **Function Duration**: Average execution time
3. **Function Errors**: Error rates and types
4. **Database Performance**: Query performance metrics

### Custom Dashboard Queries

Create custom views for business metrics:

```sql
-- Create a view for monitoring dashboard
CREATE OR REPLACE VIEW monitoring_dashboard AS
SELECT
  DATE_TRUNC('hour', created_at) as time_bucket,
  COUNT(*) as total_mentions,
  SUM(CASE WHEN status = 'posted' THEN 1 ELSE 0 END) as successful_posts,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_posts,
  AVG(CASE WHEN status = 'posted' THEN 1.0 ELSE 0.0 END) * 100 as success_rate,
  AVG(LENGTH(response_text)) as avg_response_length
FROM processed_mentions
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY time_bucket
ORDER BY time_bucket;
```

### Grafana Integration (Optional)

For advanced dashboarding, integrate with Grafana:

```yaml
# docker-compose.yml for Grafana
version: '3.8'
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - ./grafana-data:/var/lib/grafana
```

## Troubleshooting

### Common Monitoring Issues

#### 1. Health Checks Failing

```bash
# Check function status
supabase functions list

# Test health endpoint manually
curl -v https://your-project.supabase.co/functions/v1/threads-agent

# Check function logs for errors
supabase functions logs threads-agent --level error
```

#### 2. Missing Metrics

```bash
# Verify analytics table exists
supabase db diff

# Check if events are being logged
SELECT COUNT(*) FROM analytics WHERE created_at >= NOW() - INTERVAL '1 hour';

# Verify function is processing mentions
SELECT COUNT(*) FROM processed_mentions WHERE created_at >= NOW() - INTERVAL '1 hour';
```

#### 3. Alert Webhook Failures

```bash
# Test webhook manually
curl -X POST https://your-webhook-url.com/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2024-01-15T10:30:00Z",
    "service": "threads-agent",
    "severity": "info",
    "message": "Test alert"
  }'

# Check webhook URL configuration
echo $ALERT_WEBHOOK_URL
```

### Performance Troubleshooting

#### Slow Response Times

1. **Check Database Performance**:
   ```sql
   -- Slow queries
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

2. **Check External API Response Times**:
   ```bash
   # Test Threads API
   time curl "https://graph.threads.net/v1.0/me?access_token=YOUR_TOKEN"

   # Test Groq API
   time curl https://api.groq.com/openai/v1/models \
     -H "Authorization: Bearer YOUR_KEY"
   ```

3. **Check Memory Usage**:
   ```typescript
   // Log memory usage
   const memUsage = Deno.memoryUsage();
   console.log('Memory usage:', {
     heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
     heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
   });
   ```

#### High Error Rates

1. **Analyze Error Patterns**:
   ```sql
   SELECT error_message, COUNT(*)
   FROM processed_mentions
   WHERE status = 'failed'
     AND created_at >= NOW() - INTERVAL '24 hours'
   GROUP BY error_message
   ORDER BY COUNT(*) DESC;
   ```

2. **Check API Status**:
   ```bash
   # Threads API status
   curl -I "https://graph.threads.net/v1.0/me?access_token=INVALID"

   # Groq API status
   curl -I https://api.groq.com/openai/v1/models
   ```

3. **Review Rate Limiting**:
   ```sql
   SELECT
     username,
     COUNT(*) as mention_count
   FROM processed_mentions
   WHERE created_at >= NOW() - INTERVAL '1 hour'
   GROUP BY username
   HAVING COUNT(*) > 10
   ORDER BY COUNT(*) DESC;
   ```

---

## Quick Reference

### Monitoring Commands

```bash
# Health monitoring
curl https://your-project.supabase.co/functions/v1/threads-agent
npm run monitor:health

# Log monitoring
supabase functions logs threads-agent
supabase functions logs threads-agent --follow
supabase functions logs threads-agent --level error

# Performance monitoring
npm run benchmark
npm run test:performance

# Metrics queries
psql -h your-db-host -d postgres -c "SELECT * FROM monitoring_dashboard"
```

### Alert Configuration

```bash
# Set alert webhook
supabase secrets set ALERT_WEBHOOK_URL=https://your-webhook.com/alerts

# Test alerts
curl -X POST https://your-webhook.com/alerts \
  -H "Content-Type: application/json" \
  -d '{"severity": "info", "message": "Test alert"}'
```

### Dashboard URLs

- **Supabase Dashboard**: https://supabase.com/dashboard/project/YOUR_PROJECT
- **Function Logs**: Dashboard > Edge Functions > threads-agent > Logs
- **Database Metrics**: Dashboard > Database > Query Performance

For additional troubleshooting, see [troubleshooting.md](./troubleshooting.md).