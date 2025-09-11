#!/usr/bin/env node

/**
 * Server Startup Script for Consuelo Roleplay Backend
 * 
 * This script handles:
 * - MongoDB connection initialization
 * - Automatic database seeding in development
 * - Health checks and startup validation
 * - Environment verification
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../src/lib/mongodb');
const { seedDatabase } = require('../seeds/roleplaySeeds');
const Scenario = require('../models/Scenario');

async function verifyEnvironment() {
  console.log('🔍 Verifying environment configuration...');
  
  const requiredVars = ['MONGODB_URI'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ Environment configuration verified');
  
  // Log current settings
  console.log('📋 Current settings:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '[CONFIGURED]' : '[MISSING]'}`);
  console.log(`   SEED_DATABASE: ${process.env.SEED_DATABASE}`);
  console.log(`   AUTO_SEED_ON_STARTUP: ${process.env.AUTO_SEED_ON_STARTUP}`);
}

async function connectDatabase() {
  console.log('🔗 Connecting to MongoDB...');
  
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    
    // Test the connection with a simple query
    const connection = mongoose.connection;
    const collections = await connection.db.listCollections().toArray();
    console.log(`📊 Database has ${collections.length} collections`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

async function checkSeedingNeed() {
  console.log('🌱 Checking if database seeding is needed...');
  
  try {
    const scenarioCount = await Scenario.countDocuments();
    console.log(`📝 Found ${scenarioCount} existing scenarios`);
    
    const shouldSeed = process.env.FORCE_SEED === 'true' || 
                      (scenarioCount === 0 && process.env.SEED_DATABASE === 'true');
    
    if (shouldSeed) {
      console.log('🌿 Database seeding is needed');
      return true;
    } else {
      console.log('⏭️ Skipping database seeding - data already exists');
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking seeding need:', error.message);
    // If we can't check, assume we need to seed in development
    return process.env.NODE_ENV !== 'production' && process.env.SEED_DATABASE === 'true';
  }
}

async function performSeeding() {
  console.log('🌱 Starting database seeding...');
  
  try {
    const result = await seedDatabase();
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Seeded: ${result.scenarios} scenarios, ${result.characters} characters, ${result.tips} tips`);
    return result;
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    
    // In development, this might not be critical
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Continuing anyway in development mode');
      return null;
    } else {
      throw error;
    }
  }
}

async function validateSetup() {
  console.log('✅ Validating backend setup...');
  
  try {
    // Test model imports
    const Scenario = require('../models/Scenario');
    const Character = require('../models/Character');
    const RoleplaySession = require('../models/RoleplaySession');
    
    // Basic database operations test
    const scenarioCount = await Scenario.countDocuments();
    const characterCount = await Character.countDocuments();
    
    console.log('📊 Database validation:');
    console.log(`   Scenarios: ${scenarioCount}`);
    console.log(`   Characters: ${characterCount}`);
    
    console.log('✅ Backend setup validation completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Backend setup validation failed:', error.message);
    throw error;
  }
}

async function main() {
  const startTime = Date.now();
  
  console.log('🚀 Starting Consuelo Roleplay Backend Setup...');
  console.log('================================================');
  
  try {
    // Step 1: Verify environment
    await verifyEnvironment();
    
    // Step 2: Connect to database  
    await connectDatabase();
    
    // Step 3: Check and perform seeding if needed
    const needsSeeding = await checkSeedingNeed();
    if (needsSeeding) {
      await performSeeding();
    }
    
    // Step 4: Validate setup
    await validateSetup();
    
    const duration = Date.now() - startTime;
    console.log('================================================');
    console.log(`🎉 Backend setup completed successfully in ${duration}ms`);
    console.log('💡 API endpoints available at:');
    console.log('   GET /api/health - Health check');
    console.log('   GET /api/status - Service status');
    console.log('   GET /api/roleplay/* - Roleplay API routes');
    console.log('================================================');
    
  } catch (error) {
    console.error('================================================');
    console.error('❌ Backend setup failed:', error.message);
    console.error('💡 Check your environment configuration and MongoDB connection');
    console.error('================================================');
    
    // Close database connection if it was opened
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error during startup:', error);
    process.exit(1);
  });
}

module.exports = {
  verifyEnvironment,
  connectDatabase,
  checkSeedingNeed,
  performSeeding,
  validateSetup
};