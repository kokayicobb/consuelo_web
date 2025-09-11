# Testing & Validation Task - Claude Instance 5

## Your Task
Create comprehensive testing and validation suite for the complete MongoDB backend. This is part 5 of 5 parallel backend implementation tasks.

## Context
You're responsible for ensuring all the components created by the other Claude instances work together correctly and meet the requirements.

## What You Need to Create

### 1. Test Suite Structure
```
tests/
├── api.test.js          # API endpoint tests
├── models.test.js       # MongoDB model tests  
├── integration.test.js  # Full integration tests
├── helpers.js           # Test utilities
└── fixtures.js          # Test data
```

### 2. Testing Framework Setup

#### Package Dependencies
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "mongodb-memory-server": "^8.15.0"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

#### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  collectCoverageFrom: [
    'models/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### 3. Model Validation Tests (`tests/models.test.js`)

Test all models created by Claude Instance 1:

#### Scenario Model Tests
- Required field validation (scenario_id, title, description, llmPrompt)
- Unique scenario_id constraint
- Default values (is_active: true, created_by: 'system')
- Indexes creation
- Text search functionality

#### Character Model Tests  
- Required field validation (name, role, personality, background)
- Array field handling (objections, scenario_ids)
- Populate functionality with scenarios
- Default values and optional fields

#### RoleplaySession Model Tests
- Unique session_id generation
- Status enum validation
- Conversation history schema
- Duration calculation logic
- Reference validation (scenario_id, character_id)

#### SessionAnalytics Model Tests
- Score range validation (1-10)
- Required analysis fields
- Key moments schema structure
- User analytics aggregation

#### RoleplayTip Model Tests
- Category enum validation
- Difficulty level constraints
- Array field validation (techniques, practice_scenarios)
- Featured/active filtering

### 4. API Endpoint Tests (`tests/api.test.js`)

Test all routes created by Claude Instance 2:

#### Scenario Endpoints
```javascript
describe('GET /api/roleplay/scenarios', () => {
  test('should return all active scenarios', async () => {
    // Test implementation
  });
  
  test('should filter by search query', async () => {
    // Test text search functionality
  });
  
  test('should handle empty results', async () => {
    // Test edge cases
  });
});
```

#### Character Endpoints
- List all characters with population
- Filter by role (case-insensitive regex)
- Handle missing/invalid filters
- Population of scenario references

#### Session Management
- Create session with valid scenario/character
- Validate required fields (scenario_id, user_id)
- Generate unique session_id
- Update session status and calculate duration
- End session endpoint functionality
- List sessions with pagination
- Filter by user_id and status

#### Analytics Endpoints
- Retrieve analytics by session_id
- Handle non-existent sessions
- Analytics summary with pagination
- User-specific analytics filtering

#### Tips Endpoints
- Filter by category, difficulty, featured status
- Recent tips with limits
- Population of related scenarios
- Session-specific tips

### 5. Integration Tests (`tests/integration.test.js`)

Test complete workflows:

#### Full Roleplay Session Workflow
```javascript
describe('Complete Roleplay Session', () => {
  test('should handle full session lifecycle', async () => {
    // 1. Get available scenarios
    // 2. Create new session
    // 3. Update session with conversation
    // 4. End session
    // 5. Generate analytics
    // 6. Retrieve session history
  });
});
```

#### Database Seeding Integration
- Test seeding function from Claude Instance 3
- Verify all relationships are created correctly
- Validate sample data quality
- Test incremental seeding (don't duplicate)

#### Server Health & Status
- Test health endpoint response
- Verify MongoDB connection status
- Test status endpoint with available routes
- Validate environment configuration

### 6. Performance & Load Tests

#### Database Performance
- Query performance with indexes
- Pagination efficiency
- Population performance
- Text search response times

#### API Response Times
- Endpoint response benchmarks
- Concurrent request handling
- Memory usage monitoring
- Error rate under load

### 7. Validation Scripts

#### Manual Testing Script (`tests/manual-test.sh`)
```bash
#!/bin/bash
echo "🧪 Running Manual API Tests"

# Test health
curl -f http://localhost:5000/health || echo "❌ Health check failed"

# Test scenarios
curl -f http://localhost:5000/api/roleplay/scenarios || echo "❌ Scenarios failed"

# Test characters  
curl -f http://localhost:5000/api/roleplay/characters || echo "❌ Characters failed"

# Create test session
SESSION_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"scenario_id":"SCENARIO_ID","user_id":"test_user"}' \
  http://localhost:5000/api/roleplay/sessions)

echo "Session Response: $SESSION_RESPONSE"

echo "✅ Manual tests completed"
```

#### Database Validation Script (`tests/validate-db.js`)
```javascript
const mongoose = require('mongoose');
const Scenario = require('../models/Scenario');
const Character = require('../models/Character');

async function validateDatabase() {
  console.log('🔍 Validating database integrity...');
  
  // Check required collections exist
  const scenarios = await Scenario.countDocuments();
  const characters = await Character.countDocuments();
  
  console.log(`📊 Found ${scenarios} scenarios, ${characters} characters`);
  
  // Validate relationships
  const charactersWithScenarios = await Character.find().populate('scenario_ids');
  
  // Check for broken references
  // Validate data quality
  
  console.log('✅ Database validation complete');
}
```

### 8. Quality Assurance Checklist

#### Data Quality Checks
- [ ] All scenarios have realistic, detailed prompts (200+ words)
- [ ] Characters have distinct personalities and backgrounds
- [ ] Tips contain actionable, practical advice
- [ ] All relationships between models are valid
- [ ] No broken references or missing data

#### API Quality Checks  
- [ ] All endpoints return consistent response format
- [ ] Error handling is comprehensive and user-friendly
- [ ] Pagination works correctly with proper metadata
- [ ] Search and filtering functions as expected
- [ ] Population includes only necessary fields

#### Server Quality Checks
- [ ] MongoDB connection is stable and handles errors
- [ ] Environment variables are properly loaded
- [ ] Graceful shutdown works correctly
- [ ] Health checks provide accurate status
- [ ] Logging is clear and helpful

### 9. Performance Benchmarks

Set performance targets:
- API responses < 200ms for simple queries
- Database queries < 100ms with proper indexes
- Memory usage < 512MB under normal load
- Support 100+ concurrent users

### 10. Final Integration Validation

#### End-to-End Testing
```javascript
describe('Full System Integration', () => {
  test('complete roleplay platform workflow', async () => {
    // 1. Server starts and connects to MongoDB
    // 2. Database seeds successfully
    // 3. All API endpoints respond correctly
    // 4. Frontend can consume all endpoints
    // 5. Data relationships work end-to-end
  });
});
```

## Implementation Requirements

### 1. Test Database Setup
- Use MongoDB Memory Server for isolated testing
- Seed test data independently
- Clean database between tests

### 2. Test Coverage
- Aim for 80%+ code coverage
- Cover all error scenarios
- Test edge cases and boundary conditions
- Validate both success and failure paths

### 3. Realistic Test Data
- Use realistic scenario prompts
- Test with various user types
- Include edge cases (empty arrays, null values)
- Test with large datasets

## Success Criteria

- [ ] All models pass validation tests
- [ ] All API endpoints tested and working
- [ ] Integration tests pass end-to-end
- [ ] Performance benchmarks met
- [ ] Database validation passes
- [ ] Manual testing scripts work
- [ ] Error handling tested thoroughly
- [ ] Documentation complete and accurate

## Deliverables

1. Complete test suite with 80%+ coverage
2. Manual testing scripts for quick validation
3. Performance benchmark results
4. Integration validation report
5. Quality assurance checklist (completed)
6. Setup documentation for running tests

## Next Steps

After all 5 Claude instances complete their tasks:
1. Run your test suite to validate integration
2. Performance benchmark the complete system  
3. Generate final validation report
4. Document any issues found for fixes

This ensures the MongoDB backend is production-ready and meets all requirements!