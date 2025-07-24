// app/api/posthog/recordings/[id]/snapshots/route.ts
import { NextRequest, NextResponse } from 'next/server';

const POSTHOG_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const PROJECT_ID = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params since they're now a Promise in newer Next.js versions
  const resolvedParams = await params;
  console.log('Fetching snapshots for recording:', resolvedParams.id);
  
  if (!POSTHOG_API_KEY) {
    console.error('POSTHOG_PERSONAL_API_KEY not set');
    return NextResponse.json(
      { error: 'PostHog API key not configured' },
      { status: 500 }
    );
  }

  if (!PROJECT_ID) {
    console.error('NEXT_PUBLIC_POSTHOG_PROJECT_ID not set');
    return NextResponse.json(
      { error: 'PostHog project ID not configured' },
      { status: 500 }
    );
  }

  try {
    const recordingId = resolvedParams.id;
    
    // Method 1: Try the direct snapshots endpoint
    console.log('Trying direct snapshots endpoint...');
    let response = await fetch(
      `${POSTHOG_HOST}/api/projects/${PROJECT_ID}/session_recordings/${recordingId}/snapshots/`,
      {
        headers: {
          'Authorization': `Bearer ${POSTHOG_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.log('Direct endpoint failed, trying query endpoint...');
      
      // Method 2: Try the query endpoint
      response = await fetch(`${POSTHOG_HOST}/api/projects/${PROJECT_ID}/query/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${POSTHOG_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: {
            kind: 'SessionRecordingSnapshotsQuery',
            session_id: recordingId,
          },
        }),
      });

      if (!response.ok) {
        console.log('Query endpoint failed, trying events endpoint...');
        
        // Method 3: Try to get recording metadata first
        const metadataResponse = await fetch(
          `${POSTHOG_HOST}/api/projects/${PROJECT_ID}/session_recordings/${recordingId}/`,
          {
            headers: {
              'Authorization': `Bearer ${POSTHOG_API_KEY}`,
            },
          }
        );

        if (!metadataResponse.ok) {
          const errorText = await metadataResponse.text();
          console.error('Failed to fetch recording metadata:', errorText);
          return NextResponse.json(
            { error: 'Recording not found', details: errorText },
            { status: 404 }
          );
        }

        const metadata = await metadataResponse.json();
        console.log('Got metadata:', metadata);

        // Return metadata with instructions
        return NextResponse.json({
          recording: metadata,
          snapshots: null,
          message: 'Snapshots not directly available via API. Use sharing endpoint instead.',
          shareUrl: `/api/posthog/recordings/${recordingId}/share`
        });
      }
    }

    const data = await response.json();
    console.log('Successfully fetched data');
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in snapshots endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Check server logs for more details'
      },
      { status: 500 }
    );
  }
}