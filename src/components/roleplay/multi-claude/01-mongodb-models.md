# MongoDB Models Task - Claude Instance 1

## Your Task
Create all MongoDB models for the roleplay system in the `/models` directory. This is part 1 of 5 parallel backend implementation tasks.

## Context
You're working on a roleplay training system that needs MongoDB backend integration. The existing frontend is already built and needs these models to function.

## What You Need to Create

### 1. Create `/models` directory structure
```
models/
├── Scenario.js
├── Character.js  
├── RoleplaySession.js
├── SessionAnalytics.js
└── RoleplayTip.js
```

### 2. Model Specifications

#### models/Scenario.js
- scenario_id (String, unique, required)
- title (String, required, trim)
- description (String, required)  
- llmPrompt (String, required)
- is_active (Boolean, default true)
- created_by (String, default 'system')
- timestamps: true
- Indexes: scenario_id, is_active, text search on title/description

#### models/Character.js
- name (String, required, trim)
- role (String, required, trim)
- personality (String, required)
- background (String, required)
- objections (Array of Strings)
- voice_id (String, default null) 
- scenario_ids (Array of ObjectIds, ref: 'Scenario')
- is_active (Boolean, default true)
- created_by (String, default 'system')
- timestamps: true
- Indexes: scenario_ids, is_active, role

#### models/RoleplaySession.js  
- session_id (String, unique, required)
- scenario_id (ObjectId, ref: 'Scenario', required)
- character_id (ObjectId, ref: 'Character', default null)
- user_id (String, required)
- status (enum: 'active', 'completed', 'paused', 'ended', default 'active')
- start_time (Date, default now)
- end_time (Date, default null)
- total_duration (Number, default 0)
- conversation_history (Array of conversation entries)
- voice_enabled (Boolean, default false)
- metadata (Object with ip_address, user_agent, session_quality)
- timestamps: true
- Indexes: user_id + createdAt, session_id, status, scenario_id

#### models/SessionAnalytics.js
- session_id (String, unique, required)
- scenario_id (ObjectId, ref: 'Scenario', required) 
- user_id (String, required)
- Scores (all Numbers 1-10): overall_score, communication_score, objection_handling_score, rapport_building_score, closing_technique_score
- Analysis arrays: strengths, areas_for_improvement, objections_encountered, objections_handled_well, missed_opportunities, coaching_recommendations, next_steps_suggestions
- key_moments (Array with timestamp, description, score_impact)
- conversation_flow_analysis (String, required)
- analyzed_at (Date, default now)
- analysis_version (String, default '1.0')
- timestamps: true
- Indexes: user_id + createdAt, session_id, overall_score, scenario_id

#### models/RoleplayTip.js
- session_id (String, default null)
- category (enum: 'objection_handling', 'rapport_building', 'closing', 'discovery', 'presentation', required)
- title (String, required, trim)
- content (String, required)
- techniques (Array of Strings)
- practice_scenarios (Array of Strings)
- related_scenarios (Array of ObjectIds, ref: 'Scenario')
- difficulty_level (enum: 'beginner', 'intermediate', 'advanced', required)
- is_featured (Boolean, default false)
- is_active (Boolean, default true)
- created_by (String, default 'system')
- timestamps: true
- Indexes: category + difficulty_level, is_featured + is_active, createdAt, session_id

## Implementation Notes

1. Use mongoose for all models
2. Include proper validation and required fields
3. Add all specified indexes for performance
4. Use proper data types and defaults
5. Include timestamps for all models
6. Add proper references between models

## Dependencies to Install
```bash
npm install mongoose
```

## Success Criteria
- All 5 model files created with proper schemas
- All indexes defined for query performance  
- Proper field validation and types
- Model relationships properly defined
- Files follow consistent coding style

## Next Steps
Once complete, your models will be used by the API routes (handled by another Claude instance) and integrated with the server setup.