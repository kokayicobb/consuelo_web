# 08 - MongoDB Backend Integration

## Task Overview
Implement complete MongoDB backend for the roleplay system, including all database schemas, API endpoints, and data management.

## Prerequisites
- Complete files 01-07 (frontend implementation)
- MongoDB database running
- Node.js/Express backend setup

## Database Schema Design

### 1. MongoDB Collections

Create these collections in your roleplay database:

```javascript
// Database: roleplay_training
// Collections:
// - scenarios
// - characters  
// - sessions
// - analytics
// - tips
// - users (optional)
```

### 2. Schema Definitions

Create `models/` directory with these Mongoose schemas:

#### `models/Scenario.js`
```javascript
const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema({
  scenario_id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  llmPrompt: {
    type: String,
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: String, // user_id
    default: 'system'
  }
}, {
  timestamps: true
});

// Indexes for better performance
scenarioSchema.index({ scenario_id: 1 });
scenarioSchema.index({ is_active: 1 });
scenarioSchema.index({ title: 'text', description: 'text' }); // Text search

module.exports = mongoose.model('Scenario', scenarioSchema);
```

#### `models/Character.js`
```javascript
const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  personality: {
    type: String,
    required: true
  },
  background: {
    type: String,
    required: true
  },
  objections: [{
    type: String,
    trim: true
  }],
  voice_id: {
    type: String, // ElevenLabs voice ID
    default: null
  },
  scenario_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario'
  }],
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: String, // user_id
    default: 'system'
  }
}, {
  timestamps: true
});

// Indexes
characterSchema.index({ scenario_ids: 1 });
characterSchema.index({ is_active: 1 });
characterSchema.index({ role: 1 });

module.exports = mongoose.model('Character', characterSchema);
```

#### `models/RoleplaySession.js`
```javascript
const mongoose = require('mongoose');

const conversationEntrySchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  audio_duration: {
    type: Number, // seconds
    default: null
  }
});

const roleplaySessionSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    unique: true
  },
  scenario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario',
    required: true
  },
  character_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    default: null
  },
  user_id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'ended'],
    default: 'active'
  },
  start_time: {
    type: Date,
    default: Date.now
  },
  end_time: {
    type: Date,
    default: null
  },
  total_duration: {
    type: Number, // seconds
    default: 0
  },
  conversation_history: [conversationEntrySchema],
  voice_enabled: {
    type: Boolean,
    default: false
  },
  metadata: {
    ip_address: String,
    user_agent: String,
    session_quality: String
  }
}, {
  timestamps: true
});

// Indexes
roleplaySessionSchema.index({ user_id: 1, createdAt: -1 });
roleplaySessionSchema.index({ session_id: 1 });
roleplaySessionSchema.index({ status: 1 });
roleplaySessionSchema.index({ scenario_id: 1 });

module.exports = mongoose.model('RoleplaySession', roleplaySessionSchema);
```

#### `models/SessionAnalytics.js`
```javascript
const mongoose = require('mongoose');

const keyMomentSchema = new mongoose.Schema({
  timestamp: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  score_impact: {
    type: Number,
    min: -5,
    max: 5,
    default: 0
  }
});

const sessionAnalyticsSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    unique: true
  },
  scenario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario',
    required: true
  },
  user_id: {
    type: String,
    required: true
  },
  // Scores (1-10)
  overall_score: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  communication_score: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  objection_handling_score: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  rapport_building_score: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  closing_technique_score: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  // Analysis arrays
  strengths: [{
    type: String,
    trim: true
  }],
  areas_for_improvement: [{
    type: String,
    trim: true
  }],
  objections_encountered: [{
    type: String,
    trim: true
  }],
  objections_handled_well: [{
    type: String,
    trim: true
  }],
  missed_opportunities: [{
    type: String,
    trim: true
  }],
  coaching_recommendations: [{
    type: String,
    trim: true
  }],
  key_moments: [keyMomentSchema],
  conversation_flow_analysis: {
    type: String,
    required: true
  },
  next_steps_suggestions: [{
    type: String,
    trim: true
  }],
  // Processing metadata
  analyzed_at: {
    type: Date,
    default: Date.now
  },
  analysis_version: {
    type: String,
    default: '1.0'
  }
}, {
  timestamps: true
});

// Indexes
sessionAnalyticsSchema.index({ user_id: 1, createdAt: -1 });
sessionAnalyticsSchema.index({ session_id: 1 });
sessionAnalyticsSchema.index({ overall_score: -1 });
sessionAnalyticsSchema.index({ scenario_id: 1 });

module.exports = mongoose.model('SessionAnalytics', sessionAnalyticsSchema);
```

#### `models/RoleplayTip.js`
```javascript
const mongoose = require('mongoose');

const roleplayTipSchema = new mongoose.Schema({
  session_id: {
    type: String,
    default: null // null for general tips
  },
  category: {
    type: String,
    enum: ['objection_handling', 'rapport_building', 'closing', 'discovery', 'presentation'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  techniques: [{
    type: String,
    trim: true
  }],
  practice_scenarios: [{
    type: String,
    trim: true
  }],
  related_scenarios: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario'
  }],
  difficulty_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: String, // user_id or 'system'
    default: 'system'
  }
}, {
  timestamps: true
});

// Indexes
roleplayTipSchema.index({ category: 1, difficulty_level: 1 });
roleplayTipSchema.index({ is_featured: 1, is_active: 1 });
roleplayTipSchema.index({ createdAt: -1 });
roleplayTipSchema.index({ session_id: 1 });

module.exports = mongoose.model('RoleplayTip', roleplayTipSchema);
```

## API Routes Implementation

Create `routes/roleplay.js`:

```javascript
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Import models
const Scenario = require('../models/Scenario');
const Character = require('../models/Character');
const RoleplaySession = require('../models/RoleplaySession');
const SessionAnalytics = require('../models/SessionAnalytics');
const RoleplayTip = require('../models/RoleplayTip');

// GET /api/roleplay/scenarios
router.get('/scenarios', async (req, res) => {
  try {
    const { search } = req.query;
    
    let filter = { is_active: true };
    
    // Text search if search parameter is provided
    if (search) {
      filter.$text = { $search: search };
    }
    
    const scenarios = await Scenario.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      scenarios: scenarios
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scenarios'
    });
  }
});

// GET /api/roleplay/characters
router.get('/characters', async (req, res) => {
  try {
    const { role } = req.query;
    
    let filter = { is_active: true };
    if (role) filter.role = new RegExp(role, 'i');
    
    const characters = await Character.find(filter)
      .populate('scenario_ids', 'title difficulty')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      characters: characters
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch characters'
    });
  }
});

// POST /api/roleplay/sessions
router.post('/sessions', async (req, res) => {
  try {
    const { scenario_id, character_id, user_id } = req.body;
    
    if (!scenario_id || !user_id) {
      return res.status(400).json({
        success: false,
        error: 'scenario_id and user_id are required'
      });
    }
    
    // Verify scenario exists
    const scenario = await Scenario.findById(scenario_id);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
    }
    
    // Verify character exists if provided
    if (character_id) {
      const character = await Character.findById(character_id);
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Character not found'
        });
      }
    }
    
    const session = new RoleplaySession({
      session_id: `session_${uuidv4()}`,
      scenario_id,
      character_id: character_id || null,
      user_id,
      metadata: {
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });
    
    await session.save();
    
    // Populate references for response
    await session.populate('scenario_id character_id');
    
    res.status(201).json({
      success: true,
      session: session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create session'
    });
  }
});

// GET /api/roleplay/sessions
router.get('/sessions', async (req, res) => {
  try {
    const { user_id, status, limit = 50, page = 1 } = req.query;
    
    let filter = {};
    if (user_id) filter.user_id = user_id;
    if (status) filter.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const sessions = await RoleplaySession.find(filter)
      .populate('scenario_id', 'title description difficulty industry')
      .populate('character_id', 'name role personality')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await RoleplaySession.countDocuments(filter);
    
    res.json({
      success: true,
      sessions: sessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sessions'
    });
  }
});

// PATCH /api/roleplay/sessions/:id
router.patch('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Don't allow updating certain fields
    delete updates._id;
    delete updates.session_id;
    delete updates.createdAt;
    
    // Update end_time if status is being set to completed/ended
    if (updates.status && ['completed', 'ended'].includes(updates.status)) {
      updates.end_time = new Date();
      
      // Calculate duration
      const session = await RoleplaySession.findById(id);
      if (session && session.start_time) {
        updates.total_duration = Math.floor((updates.end_time - session.start_time) / 1000);
      }
    }
    
    const session = await RoleplaySession.findByIdAndUpdate(
      id, 
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('scenario_id character_id');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      session: session
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update session'
    });
  }
});

// POST /api/roleplay/sessions/:id/end
router.post('/sessions/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await RoleplaySession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    const endTime = new Date();
    const totalDuration = Math.floor((endTime - session.start_time) / 1000);
    
    session.status = 'ended';
    session.end_time = endTime;
    session.total_duration = totalDuration;
    
    await session.save();
    
    res.json({
      success: true,
      session: session
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end session'
    });
  }
});

// GET /api/roleplay/analytics/:session_id
router.get('/analytics/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    
    const analytics = await SessionAnalytics.findOne({ session_id })
      .populate('scenario_id', 'title description')
      .lean();
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: 'Analytics not found for this session'
      });
    }
    
    res.json({
      success: true,
      analytics: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

// GET /api/roleplay/analytics/summary
router.get('/analytics/summary', async (req, res) => {
  try {
    const { user_id, limit = 20, page = 1 } = req.query;
    
    let filter = {};
    if (user_id) filter.user_id = user_id;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const analytics = await SessionAnalytics.find(filter)
      .populate('scenario_id', 'title description difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      analytics: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics summary'
    });
  }
});

// GET /api/roleplay/tips
router.get('/tips', async (req, res) => {
  try {
    const { category, session_id, difficulty_level, featured } = req.query;
    
    let filter = { is_active: true };
    
    if (category) filter.category = category;
    if (session_id) filter.session_id = session_id;
    if (difficulty_level) filter.difficulty_level = difficulty_level;
    if (featured !== undefined) filter.is_featured = featured === 'true';
    
    const tips = await RoleplayTip.find(filter)
      .populate('related_scenarios', 'title difficulty')
      .sort({ is_featured: -1, createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      tips: tips
    });
  } catch (error) {
    console.error('Error fetching tips:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tips'
    });
  }
});

// GET /api/roleplay/tips/recent
router.get('/tips/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const tips = await RoleplayTip.find({ is_active: true })
      .populate('related_scenarios', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      tips: tips
    });
  } catch (error) {
    console.error('Error fetching recent tips:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent tips'
    });
  }
});

module.exports = router;
```

## Database Seeding

Create `seeds/roleplaySeeds.js`:

```javascript
const mongoose = require('mongoose');
const Scenario = require('../models/Scenario');
const Character = require('../models/Character');
const RoleplayTip = require('../models/RoleplayTip');

const seedScenarios = [
  {
    scenario_id: "life-insurance-cold-call",
    title: "Cold Call - Life Insurance",
    description: "Insurance agent calling a potential life insurance prospect",
    llmPrompt: "You are a 34-year-old marketing manager who just bought your first home 6 months ago with a $380,000 mortgage. You have a spouse and an 8-year-old daughter, and you're the primary income earner making $95,000/year. You have basic term life insurance through work (2x salary = $190,000) but haven't really thought much about whether it's enough. You're generally skeptical of insurance sales calls and initially annoyed at being interrupted during your workday. However, you're not completely closed-minded - you do worry sometimes about what would happen to your family if something happened to you, especially with the new mortgage. Your main objections will be: 'I already have coverage through work,' 'I need to discuss this with my spouse first,' 'I can't afford another bill right now with the new house,' and 'How do I know you're not just trying to oversell me?' You'll warm up slightly if the agent demonstrates genuine understanding of your situation and asks good questions about your family's needs, but you'll remain cautious about making any commitments. You want to understand the real costs and whether this is actually necessary. Start the conversation by saying you're busy at work and asking how they got your number."
  },
  {
    scenario_id: "enterprise-saas",
    title: "Enterprise SaaS Demo",
    description: "Evaluating enterprise software solution",
    llmPrompt: "You are a VP of Operations at a Fortune 500 company evaluating a new enterprise SaaS solution. You have a committee decision-making process, strict security requirements, and need to see detailed integration capabilities. You're professional but cautious, ask about compliance, scalability, and implementation timelines. You have experience with similar tools and will compare features. You're looking for a solution that can handle 10,000+ users across multiple departments. Start by expressing interest but mention you need to understand the technical specifications and security protocols."
  },
  {
    scenario_id: "budget-conscious-startup",
    title: "Startup on a Budget",
    description: "Cost-sensitive startup founder",
    llmPrompt: "You are a startup founder with limited budget who has shown interest in a business solution. You're bootstrapped with a team of 8 people and every dollar counts. You're interested in the solution but very price-sensitive and need to justify every expense to your co-founder. You ask detailed questions about pricing, what's included in different tiers, and whether there are startup discounts. You're also concerned about switching costs and want to know about free trials or money-back guarantees. Start the conversation by mentioning you're interested but need to understand the costs clearly."
  },
  {
    scenario_id: "competitor-comparison",
    title: "Comparing Competitors",
    description: "Prospect already using a competitor",
    llmPrompt: "You are currently using a competitor's solution and are reasonably satisfied but open to hearing about alternatives. You've been using your current tool for 2 years and have invested time in training your team. You're not actively looking to switch but will listen if there are compelling reasons. You ask direct comparison questions, want to know about migration support, and are concerned about disrupting current workflows. You mention specific features you like about your current solution and challenge the salesperson to show clear advantages. Start by mentioning you're already using [competitor name] and asking why you should consider switching."
  },
  {
    scenario_id: "decision-maker-busy",
    title: "Busy Executive",
    description: "Time-pressed C-level executive",
    llmPrompt: "You are a C-level executive (CEO/CFO/COO) who is extremely time-conscious and gets straight to the point. You have only 10 minutes for this call and need to see immediate value. You think in terms of ROI, business impact, and strategic advantages. You don't want to hear about features - you want to know how this solves business problems and drives results. You ask tough questions about measurable outcomes and expect concrete examples and case studies. You may mention that you'll need to involve other stakeholders if you see value. Start by mentioning you have limited time and need to understand the business impact quickly."
  },
  {
    scenario_id: "technical-buyer",
    title: "Technical Evaluation",
    description: "IT/Technical decision maker",
    llmPrompt: "You are a CTO or IT Director evaluating a technical solution. You're focused on integration capabilities, API availability, security features, scalability, and technical architecture. You ask detailed technical questions about data handling, backup procedures, compliance certifications, and integration with existing systems. You're less concerned with sales pitches and more interested in technical specifications, implementation requirements, and ongoing support. You need to present technical details to your team and want documentation. Start by asking about the technical architecture and integration capabilities."
  }
];

const seedCharacters = [
  {
    name: 'Alex Thompson',
    role: 'Startup CEO',
    personality: 'Direct, time-conscious, results-focused, analytical',
    background: 'Runs a 50-person tech startup. Previously worked at Google. Values efficiency and concrete results.',
    objections: ['Too expensive', 'No time for demos', 'Happy with current solution', 'Need to see ROI data'],
    voice_id: 'jqcCZkN6Knx8BJ5TBdYR', // Replace with actual ElevenLabs voice ID
    scenario_ids: [] // Will be populated after scenarios are created
  },
  {
    name: 'Sarah Chen',
    role: 'Procurement Manager',
    personality: 'Analytical, thorough, budget-conscious, detail-oriented',
    background: 'Manufacturing company procurement manager. Responsible for vendor relationships and cost optimization.',
    objections: ['Need to compare options', 'Budget constraints', 'Implementation timeline concerns', 'Support requirements'],
    voice_id: 'pMsXgVXv3BLzUgSXRplE', // Replace with actual ElevenLabs voice ID
    scenario_ids: []
  },
  {
    name: 'Michael Rodriguez',
    role: 'Executive Assistant',
    personality: 'Professional, protective, efficient, thorough',
    background: 'Experienced executive assistant protecting C-level executive time. Screens all calls and meetings.',
    objections: ['Executive is very busy', 'Need more information', 'Send materials first', 'Not interested in cold calls'],
    scenario_ids: []
  }
];

const seedTips = [
  {
    category: 'objection_handling',
    title: 'The Price Objection Framework',
    content: 'When prospects say "it\'s too expensive," they usually mean they don\'t see the value. Use the VBAQ method: Value, Bridge, Ask, Quantify.',
    techniques: [
      'Acknowledge the concern professionally',
      'Ask what their budget range is',
      'Present ROI calculations',
      'Offer payment options or scaled solutions'
    ],
    practice_scenarios: ['Cold Call - Tech Startup CEO', 'Warm Lead Follow-up - Manufacturing'],
    difficulty_level: 'intermediate',
    is_featured: true
  },
  {
    category: 'rapport_building',
    title: 'Quick Rapport Techniques',
    content: 'Build rapport in the first 30 seconds by finding common ground and showing genuine interest in their business.',
    techniques: [
      'Research their company beforehand',
      'Reference recent company news or achievements',
      'Use their name frequently',
      'Match their communication style and pace'
    ],
    practice_scenarios: ['All scenarios'],
    difficulty_level: 'beginner',
    is_featured: true
  },
  {
    category: 'discovery',
    title: 'Pain Point Discovery Questions',
    content: 'Uncover real business pain by asking open-ended questions that reveal challenges and impact.',
    techniques: [
      'What challenges are you facing with your current solution?',
      'How is this impacting your team/revenue/efficiency?',
      'What would solving this problem mean for your business?',
      'Have you tried other solutions? What happened?'
    ],
    practice_scenarios: ['Cold Call - Tech Startup CEO', 'Warm Lead Follow-up - Manufacturing'],
    difficulty_level: 'intermediate'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await Scenario.deleteMany({});
    await Character.deleteMany({});
    await RoleplayTip.deleteMany({});
    
    console.log('🗑️ Cleared existing data');
    
    // Seed scenarios
    const scenarios = await Scenario.insertMany(seedScenarios);
    console.log(`✅ Seeded ${scenarios.length} scenarios`);
    
    // Update characters with scenario IDs
    seedCharacters[0].scenario_ids = [scenarios[0]._id]; // Alex -> Life Insurance
    seedCharacters[1].scenario_ids = [scenarios[1]._id, scenarios[2]._id]; // Sarah -> Enterprise, Startup
    seedCharacters[2].scenario_ids = [scenarios[3]._id, scenarios[4]._id]; // Michael -> Competitor, Executive
    
    const characters = await Character.insertMany(seedCharacters);
    console.log(`✅ Seeded ${characters.length} characters`);
    
    // Update tips with scenario references
    seedTips[0].related_scenarios = [scenarios[0]._id, scenarios[1]._id];
    seedTips[2].related_scenarios = [scenarios[0]._id, scenarios[1]._id];
    
    const tips = await RoleplayTip.insertMany(seedTips);
    console.log(`✅ Seeded ${tips.length} tips`);
    
    console.log('🎉 Database seeding completed successfully!');
    
    return {
      scenarios: scenarios.length,
      characters: characters.length,
      tips: tips.length
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

module.exports = { seedDatabase };
```

## Server Setup

Update your main server file to include MongoDB and routes:

```javascript
// server.js or app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roleplay_training', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Import routes
const roleplayRoutes = require('./routes/roleplay');

// Use routes
app.use('/api/roleplay', roleplayRoutes);

// Keep your existing routes (chat, transcribe, tts)
// app.use('/api/roleplay/chat', chatRoutes);
// app.use('/api/roleplay/transcribe', transcribeRoutes);  
// app.use('/api/roleplay/tts', ttsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('⏳ Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
```

## Environment Variables

Add to your `.env` file:

```env
# Existing variables
GROQ_API_KEY=your_groq_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# New MongoDB variables
MONGODB_URI=mongodb://localhost:27017/roleplay_training
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roleplay_training

# Optional: Database seeding
SEED_DATABASE=true
```

## Installation & Startup Script

Create `package.json` scripts:

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "seed": "node -e 'require(\"./seeds/roleplaySeeds\").seedDatabase().then(() => process.exit(0))'",
    "setup": "npm install && npm run seed && npm run dev"
  },
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}
```

## Quick Setup Commands

```bash
# Install MongoDB backend dependencies
npm install express mongoose cors dotenv uuid

# Seed the database with sample data
npm run seed

# Start the server
npm run dev
```

## Integration with Frontend

Your frontend API calls (from file 03-api-integration.md) will now work with real MongoDB data instead of mock data!

## Testing the Backend

Test all endpoints:

```bash
# Get scenarios
curl http://localhost:5000/api/roleplay/scenarios

# Get characters  
curl http://localhost:5000/api/roleplay/characters

# Create session
curl -X POST http://localhost:5000/api/roleplay/sessions \
  -H "Content-Type: application/json" \
  -d '{"scenario_id": "SCENARIO_ID", "user_id": "test_user"}'
```

Now you have complete MongoDB integration! 🎯