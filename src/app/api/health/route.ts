import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';

const mongoose = require('mongoose');

export async function GET(request: NextRequest) {
  try {
    // Try to connect to database
    await connectDB();
    
    const mongoStatus = mongoose.connection.readyState;
    const isMongoConnected = mongoStatus === 1;
    
    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      mongodb: isMongoConnected ? 'connected' : 'disconnected',
      mongoStatus: {
        0: 'disconnected',
        1: 'connected', 
        2: 'connecting',
        3: 'disconnecting'
      }[mongoStatus] || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        mongodb: 'disconnected',
        error: 'Database connection failed',
        environment: process.env.NODE_ENV || 'development'
      },
      { status: 503 }
    );
  }
}