import { NextRequest, NextResponse } from 'next/server';

const POSTHOG_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const PROJECT_ID = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;
// app/api/posthog/recordings/[id]/export/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordingId = params.id;
    
    // First get the recording metadata
    const metadataResponse = await fetch(
      `${POSTHOG_HOST}/api/projects/${PROJECT_ID}/session_recordings/${recordingId}/`,
      {
        headers: {
          'Authorization': `Bearer ${POSTHOG_API_KEY}`,
        },
      }
    );

    if (!metadataResponse.ok) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      );
    }

    const metadata = await metadataResponse.json();
    
    // Return metadata for now, as full snapshot export requires additional processing
    return NextResponse.json({
      recording: metadata,
      exportInstructions: {
        message: "Full recording export requires PostHog's export feature",
        alternativeOptions: [
          "Use PostHog's built-in player",
          "Request shared link via API",
          "Export from PostHog dashboard"
        ]
      }
    });
  } catch (error) {
    console.error('Error exporting recording:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}