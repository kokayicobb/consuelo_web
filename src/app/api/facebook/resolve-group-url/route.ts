// src/app/api/facebook/resolve-group-url/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url: groupUrl } = body;

  if (!groupUrl || !groupUrl.includes('facebook.com/groups')) {
    return NextResponse.json({ error: 'Please provide a valid Facebook Group URL.' }, { status: 400 });
  }

  try {
    // --- Step 1: Use the /group/id endpoint to get the ID from the URL ---
    const getIdUrl = `https://${process.env.RAPIDAPI_FACEBOOK_HOST}/group/id?url=${encodeURIComponent(groupUrl)}`;
    
    const idResponse = await fetch(getIdUrl, {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
        'x-rapidapi-host': process.env.RAPIDAPI_FACEBOOK_HOST!,
      },
    });

    if (!idResponse.ok) {
      console.error(`Failed to resolve group ID for URL: ${groupUrl}`);
      return NextResponse.json({ error: 'Could not find a group with that URL.' }, { status: 404 });
    }

    const idData = await idResponse.json();
    const groupId = idData.id;

    if (!groupId) {
      return NextResponse.json({ error: 'Could not extract group ID from the response.' }, { status: 500 });
    }

    // --- Step 2: Use the /group/details endpoint to get the name from the ID ---
    const getDetailsUrl = `https://${process.env.RAPIDAPI_FACEBOOK_HOST}/group/details?group_id=${groupId}`;
    
    const detailsResponse = await fetch(getDetailsUrl, {
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
            'x-rapidapi-host': process.env.RAPIDAPI_FACEBOOK_HOST!,
        },
    });

    if (!detailsResponse.ok) {
        // If we can't get the name, we can still proceed with just the ID
        console.warn(`Could not fetch group details for ID: ${groupId}, but proceeding with ID.`);
        return NextResponse.json({ id: groupId, name: 'Name not found' });
    }

    const detailsData = await detailsResponse.json();
    const groupName = detailsData.name || 'Name not found';

    // --- Step 3: Return the complete object to the frontend ---
    return NextResponse.json({ id: groupId, name: groupName });

  } catch (error) {
    console.error('Error in resolve-group-url:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}