# Server Setup & Integration Task - Claude Instance 4

## Your Task
Set up the complete Express server with MongoDB integration and route mounting. This is part 4 of 5 parallel backend implementation tasks.

## Context
You're responsible for the main server configuration that ties together the models, routes, and database connections created by other Claude instances.

## What You Need to Create/Update

### 1. Main Server File Setup
Update existing server file (likely `server.js`, `app.js`, or `index.js`) to integrate MongoDB and roleplay routes.

### 2. Server Configuration Requirements

#### Core Setup
- Express app with middleware
- MongoDB connection with proper error handling
- CORS configuration
- JSON parsing with size limits
- Environment variables loading

#### MongoDB Integration
```javascript
const mongoose = require('mongoose');

// Connection with proper options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roleplay_training', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});
```

#### Route Integration
Mount the roleplay routes created by another Claude:
```javascript
const roleplayRoutes = require('./routes/roleplay');
app.use('/api/roleplay', roleplayRoutes);
```

#### Middleware Stack
```javascript
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
```

### 3. Environment Configuration

#### Required Environment Variables
Create/update `.env` file:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/roleplay_training
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/roleplay_training

# Optional: Auto-seeding
SEED_DATABASE=true

# Existing variables (keep these)
GROQ_API_KEY=your_groq_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

#### Production Considerations
- Handle different environments (development/production)
- Use MongoDB Atlas URI for production
- Proper error handling for missing env vars

### 4. Package.json Updates

Add/update dependencies:
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0", 
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "uuid": "^9.0.0"
  },
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "seed": "node -e 'require(\"./seeds/roleplaySeeds\").seedDatabase().then(() => process.exit(0))'",
    "setup": "npm install && npm run seed && npm run dev"
  }
}
```

### 5. Health Check & Status Endpoints

Add system health endpoint:
```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    service: 'roleplay-backend',
    version: '1.0.0',
    mongodb: mongoose.connection.readyState === 1,
    endpoints: [
      'GET /api/roleplay/scenarios',
      'GET /api/roleplay/characters',
      'POST /api/roleplay/sessions',
      'GET /api/roleplay/sessions',
      'PATCH /api/roleplay/sessions/:id',
      'GET /api/roleplay/analytics/:session_id',
      'GET /api/roleplay/tips'
    ]
  });
});
```

### 6. Graceful Shutdown

Implement proper cleanup:
```javascript
process.on('SIGINT', async () => {
  console.log('⏳ Shutting down gracefully...');
  
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB:', error);
  }
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('⏳ SIGTERM received, shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});
```

### 7. Auto-Seeding (Optional)

Add automatic database seeding for development:
```javascript
// Auto-seed in development if database is empty
if (process.env.NODE_ENV !== 'production' && process.env.SEED_DATABASE === 'true') {
  mongoose.connection.once('connected', async () => {
    const { seedDatabase } = require('./seeds/roleplaySeeds');
    
    try {
      const Scenario = require('./models/Scenario');
      const count = await Scenario.countDocuments();
      
      if (count === 0) {
        console.log('📋 Database is empty, running seeds...');
        await seedDatabase();
      }
    } catch (error) {
      console.error('⚠️ Seeding error:', error);
    }
  });
}
```

## Implementation Requirements

### 1. Server Structure
```javascript
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
// ... (connection code)

// Routes
const roleplayRoutes = require('./routes/roleplay');
app.use('/api/roleplay', roleplayRoutes);

// Keep existing routes if any
// app.use('/api/chat', chatRoutes);
// app.use('/api/transcribe', transcribeRoutes);
// app.use('/api/tts', ttsRoutes);

// Health checks
// ... (health endpoints)

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
// ... (shutdown handlers)
```

### 2. Error Handling
- Catch MongoDB connection errors
- Handle missing environment variables
- Graceful shutdown on process signals
- Clear error messages with emojis

### 3. Development Experience
- Nodemon for auto-restart
- Clear console output with progress indicators
- Auto-seeding for development
- Health check endpoints for monitoring

## Integration Points

### With Other Tasks:
- **Models**: Import from `./models/[ModelName]`
- **Routes**: Mount from `./routes/roleplay`  
- **Seeds**: Auto-run from `./seeds/roleplaySeeds`
- **Testing**: Health endpoints for validation

### With Frontend:
- CORS enabled for frontend domain
- JSON parsing for API requests
- Routes mounted at `/api/roleplay/*`

## Success Criteria

- Server starts successfully with MongoDB connection
- All routes properly mounted and accessible
- Environment variables properly loaded
- Auto-seeding works in development
- Health check endpoints respond correctly
- Graceful shutdown implemented
- Clear console output with progress/status
- Error handling for common failures

## Testing Commands

After implementation, verify:
```bash
# Install dependencies
npm install

# Seed database  
npm run seed

# Start server
npm run dev

# Test health
curl http://localhost:5000/health

# Test status
curl http://localhost:5000/api/status

# Test API endpoint
curl http://localhost:5000/api/roleplay/scenarios
```

## Next Steps
Your server setup will be validated by the testing suite created by another Claude instance to ensure all integrations work correctly.