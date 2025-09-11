import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';

const mongoose = require('mongoose');

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const mongoStatus = mongoose.connection.readyState;
    const isMongoConnected = mongoStatus === 1;
    
    return NextResponse.json({
      service: 'consuelo-roleplay-backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      mongodb: isMongoConnected,
      environment: process.env.NODE_ENV || 'development',
      endpoints: [
        'GET /api/roleplay/scenarios',
        'GET /api/roleplay/characters', 
        'POST /api/roleplay/sessions',
        'GET /api/roleplay/sessions',
        'PATCH /api/roleplay/sessions/:id',
        'POST /api/roleplay/sessions/:id/end',
        'GET /api/roleplay/analytics/:session_id',
        'GET /api/roleplay/analytics/summary',
        'GET /api/roleplay/tips',
        'GET /api/roleplay/tips/recent'
      ],
      features: {
        mongoConnection: isMongoConnected,
        autoSeeding: process.env.SEED_DATABASE === 'true',
        cors: true,
        healthChecks: true
      }
    });
  } catch (error) {
    console.error('Status check failed:', error);
    return NextResponse.json(
      {
        service: 'consuelo-roleplay-backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        mongodb: false,
        error: 'Database connection failed',
        environment: process.env.NODE_ENV || 'development'
      },
      { status: 503 }
    );
  }
}