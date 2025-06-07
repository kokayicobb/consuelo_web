import { NextRequest, NextResponse } from 'next/server';
import { ApolloService } from '@/lib/apollo-service';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.APOLLO_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Apollo API key not configured' },
        { status: 500 }
      );
    }

    const { email } = await request.json();
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const apolloService = new ApolloService(apiKey);
    const enrichedContact = await apolloService.enrichPerson(email);
    
    return NextResponse.json(enrichedContact);
  } catch (error) {
    console.error('Apollo enrichment error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to enrich contact',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}