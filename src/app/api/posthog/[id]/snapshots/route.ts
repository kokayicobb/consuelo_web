// app/api/posthog/recordings/[id]/snapshots/route.ts
import { NextRequest, NextResponse } from 'next/server';

const POSTHOG_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const PROJECT_ID = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordingId = params.id;
    
    // PostHog uses internal endpoints to fetch snapshots
    // This is not officially documented but can be reverse-engineered
    const snapshotUrl = `${POSTHOG_HOST}/api/projects/${PROJECT_ID}/session_recordings/${recordingId}/snapshots/`;
    
    const response = await fetch(snapshotUrl, {
      headers: {
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Alternative: Try to get via query endpoint
      const queryResponse = await fetch(`${POSTHOG_HOST}/api/projects/${PROJECT_ID}/query/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${POSTHOG_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: {
            kind: 'SessionRecordingSnapshotQuery',
            session_id: recordingId,
          },
        }),
      });

      if (!queryResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch recording snapshots' },
          { status: queryResponse.status }
        );
      }

      const data = await queryResponse.json();
      return NextResponse.json(data);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}