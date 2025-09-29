# Testing Strategy and Guidelines

This document outlines the comprehensive testing strategy for the Threads Agent Edge Function, including unit tests, integration tests, performance tests, and testing best practices.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Structure](#test-structure)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [Test Data Management](#test-data-management)
8. [Continuous Integration](#continuous-integration)
9. [Best Practices](#best-practices)

## Testing Philosophy

Our testing strategy follows these core principles:

- **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
- **Fast Feedback**: Tests should run quickly to enable rapid development
- **Isolation**: Tests should be independent and not affect each other
- **Reliability**: Tests should be deterministic and not flaky
- **Maintainability**: Tests should be easy to understand and maintain

### Test Categories

```
       /\
      /  \
     /____\    E2E Tests (Few)
    /      \
   /________\  Integration Tests (Some)
  /          \
 /____________\ Unit Tests (Many)
```

## Test Structure

### Directory Organization

```
supabase/functions/threads-agent/tests/
├── unit/                     # Unit tests
│   ├── threads-client.test.ts
│   ├── ai-response.test.ts
│   ├── database.test.ts
│   └── context-parser.test.ts
├── integration/              # Integration tests
│   ├── full-workflow.test.ts
│   └── database-integration.test.ts
├── performance/              # Performance tests
│   ├── benchmark.ts
│   └── load-test.ts
├── mocks/                    # Mock data and utilities
│   ├── threads-api-mock.ts
│   ├── groq-api-mock.ts
│   └── test-data.ts
└── helpers/                  # Test utilities
    ├── test-setup.ts
    └── test-utils.ts
```

### Test Commands

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

# Run specific test file
deno test --allow-all supabase/functions/threads-agent/tests/unit/database.test.ts
```

## Unit Testing

Unit tests focus on testing individual functions and components in isolation.

### What We Test

- **Database Operations**: CRUD operations, query logic
- **API Clients**: Threads API, AI API interactions
- **Business Logic**: Message processing, response generation
- **Utility Functions**: Data validation, formatting, helpers

### Unit Test Example

```typescript
// supabase/functions/threads-agent/tests/unit/database.test.ts
import { assertEquals, assertExists } from "../helpers/test-setup.ts";
import { TestDataBuilder } from "../helpers/test-utils.ts";

Deno.test("Database - should save processed mentions successfully", async () => {
  const db = new TestThreadsDatabase();
  const records = [
    TestDataBuilder.createProcessedRecord({
      mention_id: 'test-save-1',
      thread_text: 'Test thread 1',
      response_text: 'Test response 1',
      username: 'test_user1'
    })
  ];

  await db.saveProcessedMentions(records);

  const mentionIds = await db.getProcessedMentions();
  assertEquals(mentionIds.includes('test-save-1'), true);
});
```

### Mocking Strategy

We use comprehensive mocking to isolate units under test:

#### API Mocking

```typescript
// Mock Threads API
const threadsApiMock = ThreadsApiMock.createSuccessScenario();
globalThis.fetch = threadsApiMock.createMockFetch();

// Mock Groq AI API
const groqApiMock = GroqApiMock.createSuccessScenario();
globalThis.fetch = groqApiMock.createMockFetch();
```

#### Database Mocking

```typescript
// Use test database with isolated data
const testDb = createTestSupabaseClient();
await setupTestDatabase();
```

### Test Coverage Goals

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 95%
- **Lines**: > 90%

## Integration Testing

Integration tests verify that components work correctly together.

### What We Test

- **End-to-End Workflows**: Complete mention processing pipeline
- **Database Integration**: Real database operations with test data
- **API Integration**: External API interactions with mocking
- **Error Scenarios**: Failure modes and recovery

### Integration Test Example

```typescript
Deno.test("Integration - should process new mentions end-to-end", async () => {
  await setupIntegrationTest();

  try {
    // Configure for some mentions
    threadsApiMock.updateConfig({ mentionsCount: 3, repliesCount: 2 });

    const workflow = new IntegrationTestWorkflow();
    const result = await workflow.processThreadsMentions();

    assertExists(result);
    assertEquals(result.success, true);
    assertEquals(result.summary.totalFound > 0, true);
    assertEquals(result.summary.newProcessed > 0, true);
    assertEquals(result.summary.posted > 0, true);

    // Verify database state
    const workflow2 = new IntegrationTestWorkflow();
    const result2 = await workflow2.processThreadsMentions();

    // Second run should find no new mentions
    assertEquals(result2.summary.newProcessed, 0);

  } finally {
    await teardownIntegrationTest();
  }
});
```

### Integration Test Scenarios

1. **Happy Path**: Normal processing flow
2. **Error Recovery**: API failures, retries
3. **Rate Limiting**: Handling API rate limits
4. **Data Persistence**: Verifying data is saved correctly
5. **Concurrent Processing**: Multiple requests simultaneously

## Performance Testing

Performance tests ensure the system meets response time and throughput requirements.

### Performance Benchmarks

```typescript
// supabase/functions/threads-agent/tests/performance/benchmark.ts
class PerformanceBenchmark {
  async benchmarkDatabaseOperations() {
    await this.runBenchmark(
      "Database - Single Record Insert",
      async () => {
        // Insert single record and measure time
        const record = TestDataBuilder.createProcessedRecord();
        await supabase.from('processed_mentions').insert([record]);
        return 1;
      }
    );
  }

  async benchmarkBatchProcessing() {
    await this.runBenchmark(
      "Batch Processing - 50 Mentions",
      async () => {
        const mentions = generateTestBatch(50, 'mention');
        // Process all mentions and measure time
        return mentions.length;
      }
    );
  }
}
```

### Performance Metrics

| Operation | Target | Warning | Critical |
|-----------|--------|---------|----------|
| Single DB Insert | < 100ms | > 500ms | > 1000ms |
| Batch Processing (10) | < 5s | > 15s | > 30s |
| API Response | < 200ms | > 1s | > 5s |
| AI Generation | < 3s | > 10s | > 20s |

### Load Testing

```bash
# Run performance benchmarks
npm run benchmark

# Specific benchmarks
deno run --allow-all supabase/functions/threads-agent/tests/performance/benchmark.ts
```

## Security Testing

Security tests verify that the system properly handles authentication, authorization, and input validation.

### Security Test Coverage

1. **Input Validation**: Test malformed inputs
2. **Authentication**: Verify API key validation
3. **Rate Limiting**: Test rate limit enforcement
4. **Data Encryption**: Verify sensitive data handling
5. **Error Disclosure**: Ensure no sensitive info in errors

### Security Test Example

```typescript
Deno.test("Security - should validate API inputs", async () => {
  const maliciousInput = {
    triggered_by: "<script>alert('xss')</script>",
    data: "'; DROP TABLE processed_mentions; --"
  };

  const response = await fetch('/functions/v1/threads-agent', {
    method: 'POST',
    body: JSON.stringify(maliciousInput)
  });

  // Should handle malicious input safely
  assertEquals(response.status, 400);

  const result = await response.json();
  assertExists(result.error);
  assertEquals(result.error.includes('<script>'), false);
});
```

## Test Data Management

### Test Data Strategy

- **Isolation**: Each test uses unique identifiers
- **Cleanup**: Automatic cleanup after each test
- **Factories**: Use data builders for consistent test data
- **Fixtures**: Predefined data sets for common scenarios

### Data Builders

```typescript
export class TestDataBuilder {
  static createThreadsMention(overrides: Partial<ThreadsMention> = {}): ThreadsMention {
    return {
      mention_id: `test-mention-${Date.now()}`,
      thread_text: 'This is a test mention',
      username: 'testuser',
      timestamp: new Date().toISOString(),
      permalink: 'https://threads.net/test-permalink',
      type: 'direct_mention',
      ...overrides
    };
  }

  static createBatchMentions(count: number): ThreadsMention[] {
    return Array.from({ length: count }, (_, i) =>
      this.createThreadsMention({
        mention_id: `test-mention-batch-${Date.now()}-${i}`,
        username: `testuser${i}`,
        thread_text: `Test mention ${i + 1}`
      })
    );
  }
}
```

### Test Database Setup

```typescript
export async function setupTestDatabase() {
  const supabase = createTestSupabaseClient();

  // Clear test data
  await supabase.from('processed_mentions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('thread_contexts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  return supabase;
}

export async function cleanupTestDatabase() {
  const supabase = createTestSupabaseClient();

  // Remove test data
  await supabase.from('processed_mentions').delete().like('mention_id', 'test-%');
  await supabase.from('thread_contexts').delete().like('thread_id', 'test-%');
}
```

## Continuous Integration

### CI Pipeline

Our CI pipeline runs on every pull request and push to main:

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: denoland/setup-deno@v1
      - name: Run linter
        run: npm run lint
      - name: Run unit tests
        run: npm run test:unit
      - name: Run integration tests
        run: npm run test:integration
      - name: Run security scan
        run: npm run security:scan
      - name: Generate coverage
        run: npm run test:coverage
```

### Test Gates

Tests must pass before:

- **Merging PRs**: All tests must pass
- **Deploying to staging**: Unit + integration tests
- **Deploying to production**: Full test suite + security scan

### Coverage Reporting

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
deno coverage coverage --html
```

## Best Practices

### Writing Good Tests

#### 1. Test Names

Use descriptive test names that explain the scenario:

```typescript
// Good
Deno.test("Database - should return empty array when no processed mentions", async () => {

// Bad
Deno.test("test database", async () => {
```

#### 2. Test Structure

Follow the Arrange-Act-Assert pattern:

```typescript
Deno.test("AI Response - should generate response for technical question", async () => {
  // Arrange
  setupAIResponseTest();
  const mention = TestDataBuilder.createThreadsMention({
    thread_text: "@consuelohq How do I debug JavaScript?",
    username: "js_learner"
  });

  // Act
  const result = await aiGenerator.generateResponse(mention, "consuelohq");

  // Assert
  assertExists(result);
  assertEquals(result.category, "technical");
  assertEquals(result.response.length > 0, true);
});
```

#### 3. Test Independence

Each test should be independent:

```typescript
// Good - each test sets up its own data
Deno.test("should save mention", async () => {
  const mention = TestDataBuilder.createProcessedRecord();
  await db.saveProcessedMentions([mention]);
  // Test logic...
});

// Bad - tests depend on shared state
let sharedData: any;
Deno.test("setup data", () => { sharedData = ...; });
Deno.test("test with data", () => { /* uses sharedData */ });
```

### Test Debugging

#### Running Specific Tests

```bash
# Run single test file
deno test --allow-all supabase/functions/threads-agent/tests/unit/database.test.ts

# Run tests matching pattern
deno test --allow-all --filter "Database" supabase/functions/threads-agent/tests/

# Run with verbose output
deno test --allow-all -v supabase/functions/threads-agent/tests/
```

#### Debug Mode

```bash
# Enable debug logging
ENABLE_DEBUG_LOGGING=true npm test

# Run with inspector
deno test --allow-all --inspect-brk supabase/functions/threads-agent/tests/unit/database.test.ts
```

### Performance Testing Guidelines

1. **Establish Baselines**: Measure current performance before optimizing
2. **Test Realistic Scenarios**: Use realistic data volumes and patterns
3. **Monitor Trends**: Track performance over time
4. **Set Thresholds**: Define acceptable performance ranges
5. **Automate Regression Testing**: Fail builds if performance degrades

### Security Testing Guidelines

1. **Test Input Validation**: Try malformed, oversized, and malicious inputs
2. **Test Authentication**: Verify all endpoints require proper auth
3. **Test Rate Limiting**: Ensure rate limits are enforced
4. **Test Error Handling**: Verify no sensitive data in error messages
5. **Regular Security Scans**: Use automated tools for security scanning

---

## Quick Reference

### Test Commands

```bash
# Development
npm test                      # Run all tests
npm run test:watch           # Watch mode
npm run test:unit            # Unit tests only
npm run test:integration     # Integration tests only

# Coverage
npm run test:coverage        # Generate coverage report
deno coverage coverage       # View coverage details

# Performance
npm run benchmark           # Run performance benchmarks
npm run test:performance    # Performance test suite

# Security
npm run security:scan       # Security vulnerability scan

# Specific tests
deno test --allow-all --filter "Database" tests/
deno test --allow-all tests/unit/database.test.ts
```

### Assertion Helpers

```typescript
// Basic assertions
assertEquals(actual, expected)
assertExists(value)
assertThrows(() => { ... })
assertThrowsAsync(async () => { ... })

// Custom assertions from test-setup.ts
createPerformanceTimer()
createMockResponse(data, status)
generateTestMentionId()
```

### Mock Scenarios

```typescript
// API Mocks
ThreadsApiMock.createSuccessScenario()
ThreadsApiMock.createFailureScenario()
ThreadsApiMock.createRateLimitScenario()

GroqApiMock.createSuccessScenario()
GroqApiMock.createTechnicalResponseScenario()

// Database Utilities
DatabaseTestUtils.insertTestMention()
DatabaseTestUtils.clearTestData()
```

For more detailed examples, see the test files in the `tests/` directory.