# API Routes Task - Claude Instance 2  

## Your Task
Create complete Express.js API routes for the roleplay system. This is part 2 of 5 parallel backend implementation tasks.

## Context
You're implementing API endpoints that will be consumed by an existing React frontend. The MongoDB models are being created by another Claude instance in parallel.

## What You Need to Create

### 1. Create `/routes/roleplay.js`
Main API route file with all endpoints for scenarios, characters, sessions, analytics, and tips.

### 2. Required Endpoints

#### Scenario Endpoints
- `GET /api/roleplay/scenarios` - List all active scenarios with optional text search
- Query params: search (optional)
- Response: { success: boolean, scenarios: Scenario[] }

#### Character Endpoints  
- `GET /api/roleplay/characters` - List all active characters with optional role filter
- Query params: role (optional)
- Response: { success: boolean, characters: Character[] }
- Include populated scenario_ids with title/difficulty

#### Session Endpoints
- `POST /api/roleplay/sessions` - Create new roleplay session
- Body: { scenario_id, character_id?, user_id }
- Response: { success: boolean, session: RoleplaySession }
- Generate unique session_id using uuid
- Validate scenario/character exist

- `GET /api/roleplay/sessions` - List sessions with filters/pagination
- Query params: user_id?, status?, limit=50, page=1
- Response: { success: boolean, sessions: RoleplaySession[], pagination: object }
- Include populated scenario_id and character_id

- `PATCH /api/roleplay/sessions/:id` - Update session (status, conversation, etc.)
- Auto-calculate duration when status becomes 'completed'/'ended'
- Don't allow updating protected fields (_id, session_id, createdAt)

- `POST /api/roleplay/sessions/:id/end` - End a session
- Calculate total_duration, set end_time, status='ended'

#### Analytics Endpoints
- `GET /api/roleplay/analytics/:session_id` - Get analytics for specific session
- Response: { success: boolean, analytics: SessionAnalytics }
- Include populated scenario_id

- `GET /api/roleplay/analytics/summary` - Get analytics summary with pagination  
- Query params: user_id?, limit=20, page=1
- Response: { success: boolean, analytics: SessionAnalytics[] }

#### Tips Endpoints
- `GET /api/roleplay/tips` - Get tips with filters
- Query params: category?, session_id?, difficulty_level?, featured?
- Response: { success: boolean, tips: RoleplayTip[] }
- Include populated related_scenarios

- `GET /api/roleplay/tips/recent` - Get recent tips
- Query params: limit=10
- Response: { success: boolean, tips: RoleplayTip[] }

## Implementation Requirements

### 1. Error Handling
- Wrap all endpoints in try-catch blocks
- Return consistent error format: { success: false, error: string }
- Log errors with console.error()
- Use appropriate HTTP status codes (400, 404, 500)

### 2. Validation
- Validate required fields for POST/PATCH requests
- Check if referenced documents exist before creating relationships
- Return 404 for missing resources

### 3. Response Format
All responses should follow this structure:
```javascript
{
  success: boolean,
  data?: any,
  error?: string,
  pagination?: {
    total: number,
    page: number, 
    limit: number,
    totalPages: number
  }
}
```

### 4. Population
- Populate referenced fields appropriately
- Only include necessary fields to reduce response size
- scenarios: 'title description difficulty'  
- characters: 'name role personality'

### 5. Query Features
- Text search for scenarios using MongoDB $text
- Regex search for character roles (case-insensitive)
- Proper pagination with skip/limit
- Sorting by createdAt descending

## Code Structure Template

```javascript
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Import models (they'll be created by another Claude)
const Scenario = require('../models/Scenario');
const Character = require('../models/Character'); 
const RoleplaySession = require('../models/RoleplaySession');
const SessionAnalytics = require('../models/SessionAnalytics');
const RoleplayTip = require('../models/RoleplayTip');

// GET /api/roleplay/scenarios
router.get('/scenarios', async (req, res) => {
  // Implementation here
});

// ... other endpoints

module.exports = router;
```

## Dependencies to Install
```bash
npm install express uuid
```

## Success Criteria
- All 10 endpoints implemented with proper error handling
- Consistent response format across all endpoints
- Proper validation and status codes
- Population of referenced fields
- Pagination implemented where needed
- Clean, readable code with comments

## Integration Points
- Models will be available from `../models/[ModelName]` 
- Routes will be mounted at `/api/roleplay` in main server
- Frontend expects specific response format shown above

## Next Steps
Your routes will be integrated with the server setup (another Claude instance) and tested with the validation suite.