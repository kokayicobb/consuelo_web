// app/api/posthog/recordings/[id]/share/route.ts
import { NextRequest, NextResponse } from 'next/server';

const POSTHOG_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const PROJECT_ID = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params since they're now a Promise
    const resolvedParams = await params;
    const recordingId = resolvedParams.id;
    
    // Enable sharing for this recording
    const shareUrl = `${POSTHOG_HOST}/api/projects/${PROJECT_ID}/session_recordings/${recordingId}/sharing/`;
    
    const response = await fetch(shareUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enabled: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Sharing error:', errorData);
      return NextResponse.json(
        { error: 'Failed to enable sharing' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Construct the shareable URL
    const shareableUrl = `${POSTHOG_HOST}/shared/session/${data.access_token}`;
    
    return NextResponse.json({
      success: true,
      shareableUrl,
      accessToken: data.access_token,
      embedUrl: `${shareableUrl}?embedded=true`,
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}