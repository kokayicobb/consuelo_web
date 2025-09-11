# Database Seeding Task - Claude Instance 3

## Your Task
Create database seeding system with realistic sample data for the roleplay system. This is part 3 of 5 parallel backend implementation tasks.

## Context
You need to create a comprehensive seeding system that populates the database with realistic scenarios, characters, and tips for a sales roleplay training platform.

## What You Need to Create

### 1. Create `/seeds/roleplaySeeds.js`
Main seeding file with sample data and seeding logic.

### 2. Sample Data Requirements

#### Scenarios (6 realistic sales scenarios)
Create these specific scenarios with detailed prompts:

1. **"life-insurance-cold-call"** - Cold calling for life insurance
   - Prospect: 34-year-old marketing manager, new homeowner, primary earner
   - Has basic work insurance, skeptical but concerned about family security
   
2. **"enterprise-saas"** - Enterprise software demo
   - Prospect: VP of Operations at Fortune 500, committee decisions, security focused
   
3. **"budget-conscious-startup"** - Startup founder with limited budget
   - Prospect: Bootstrapped startup founder, team of 8, every dollar counts
   
4. **"competitor-comparison"** - Prospect using competitor solution
   - Prospect: Using competitor for 2 years, satisfied but open to better options
   
5. **"decision-maker-busy"** - Time-pressed C-level executive
   - Prospect: CEO/CFO/COO with 10 minutes, wants ROI focus
   
6. **"technical-buyer"** - IT/Technical decision maker
   - Prospect: CTO focused on integration, security, scalability

Each scenario needs:
- scenario_id (unique string)
- title (short, descriptive)
- description (brief summary)
- llmPrompt (detailed character prompt 200-300 words with personality, objections, background)

#### Characters (3 diverse characters)
1. **Alex Thompson** - Startup CEO
   - Direct, analytical, results-focused
   - Objections: Cost, time, ROI proof needed
   
2. **Sarah Chen** - Procurement Manager
   - Analytical, thorough, budget-conscious
   - Manufacturing background, vendor relationships
   
3. **Michael Rodriguez** - Executive Assistant  
   - Professional, protective of executive time
   - Screens calls, needs information first

Each character needs:
- name, role, personality, background
- objections array (4+ realistic objections)
- voice_id (placeholder for ElevenLabs)
- scenario_ids (will be linked after scenarios created)

#### Tips (3+ coaching tips)
1. **Price Objection Framework** - objection_handling, intermediate
2. **Quick Rapport Techniques** - rapport_building, beginner  
3. **Pain Point Discovery Questions** - discovery, intermediate

Each tip needs:
- category, title, content
- techniques array (4+ actionable techniques)
- practice_scenarios, difficulty_level
- is_featured flag for important tips

### 3. Seeding Function Structure

```javascript
const mongoose = require('mongoose');
// Import all models

const seedScenarios = [
  // Array of 6 scenario objects
];

const seedCharacters = [
  // Array of 3 character objects  
];

const seedTips = [
  // Array of 3+ tip objects
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await Scenario.deleteMany({});
    await Character.deleteMany({});
    await RoleplayTip.deleteMany({});
    
    // Seed scenarios first
    const scenarios = await Scenario.insertMany(seedScenarios);
    
    // Update characters with scenario IDs
    // Link characters to appropriate scenarios
    
    const characters = await Character.insertMany(seedCharacters);
    
    // Update tips with scenario references
    const tips = await RoleplayTip.insertMany(seedTips);
    
    console.log('🎉 Database seeding completed!');
    return { scenarios: scenarios.length, characters: characters.length, tips: tips.length };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

module.exports = { seedDatabase };
```

### 4. Package.json Script
Add to scripts section:
```json
{
  "scripts": {
    "seed": "node -e 'require(\"./seeds/roleplaySeeds\").seedDatabase().then(() => process.exit(0))'"
  }
}
```

## Implementation Requirements

### 1. Realistic Content
- Scenarios must feel like real sales situations
- Character personalities should be distinct and believable  
- Objections should be common and realistic
- Tips should be actionable and practical

### 2. Data Relationships
- Link characters to appropriate scenarios
- Connect tips to relevant scenarios
- Ensure referential integrity

### 3. Proper Seeding Flow
- Clear existing data first
- Seed in correct order (scenarios → characters → tips)
- Update relationships after creation
- Handle errors gracefully
- Provide progress feedback

### 4. Console Output
- Use emojis and clear messaging
- Show progress for each step
- Display counts of seeded items
- Log errors clearly

## Quality Standards

### Scenario Prompts Should:
- Be 200-300 words each
- Include specific background details
- Define clear personality traits  
- List 3-4 realistic objections
- Set up the conversation start

### Character Profiles Should:
- Have distinct personalities
- Include professional backgrounds
- List 4+ relevant objections
- Be diverse in roles/industries

### Tips Should:
- Provide actionable techniques
- Include 4+ specific strategies
- Reference relevant scenarios
- Have appropriate difficulty levels

## Success Criteria
- 6 realistic scenarios with detailed prompts
- 3 diverse characters with proper linking
- 3+ coaching tips with practical advice
- Seeding function that clears and repopulates data
- Proper error handling and progress logging
- Data relationships correctly established

## Testing
After seeding, verify:
- All scenarios have required fields
- Characters link to correct scenarios
- Tips reference appropriate scenarios
- Console output is clear and informative

## Next Steps
Your seeded data will be used by the API routes and tested with the validation suite created by other Claude instances.