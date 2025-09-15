const mongoose = require('mongoose');

let isConnected = false;
let connectionPromise = null;

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  // If already connected and healthy, return immediately
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  // If connection is already in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // Start new connection
  connectionPromise = (async () => {
    try {
      // Only close if we have a connection that's not already closed
      if (mongoose.connection.readyState !== 0) {
        console.log('🔄 Closing existing MongoDB connection...');
        await mongoose.connection.close();
        isConnected = false;
      }

      const options = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        retryWrites: true,
        retryReads: true
      };

      console.log('🔗 Connecting to MongoDB...');
      await mongoose.connect(mongoUri, options);

      isConnected = true;
      console.log('✅ Connected to MongoDB successfully');

      // Set up connection event listeners only once
      if (!mongoose.connection.listeners('error').length) {
        mongoose.connection.on('error', (error) => {
          console.error('❌ MongoDB connection error:', error);
          isConnected = false;
          connectionPromise = null;
        });

        mongoose.connection.on('disconnected', () => {
          console.log('⚠️ MongoDB disconnected');
          isConnected = false;
          connectionPromise = null;
        });

        mongoose.connection.on('reconnected', () => {
          console.log('🔄 MongoDB reconnected');
          isConnected = true;
        });
      }

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      isConnected = false;
      connectionPromise = null;
      throw error;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (isConnected) {
    console.log('⏳ Shutting down MongoDB connection...');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    isConnected = false;
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (isConnected) {
    console.log('⏳ SIGTERM received, closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    isConnected = false;
  }
});

module.exports = connectDB;
module.exports.default = connectDB;