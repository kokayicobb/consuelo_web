// app/api/reddit/post-details/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json(
      { error: 'Post URL is required' },
      { status: 400 }
    );
  }

  console.log('Fetching post details for:', url);

  try {
    const apiUrl = `https://reddit3.p.rapidapi.com/v1/reddit/post?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
        'x-rapidapi-host': 'reddit3.p.rapidapi.com'
      }
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Error fetching post details:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch post details' },
        { status: response.status }
      );
    }

    try {
      const data = JSON.parse(responseText);
      console.log('Post details response structure:', Object.keys(data));
      
      // Extract the post content from various possible locations
      let postContent = '';
      let postData = null;
      
      if (data.body) {
        postData = data.body;
      } else if (data.data) {
        postData = data.data;
      } else if (data[0] && data[0].data) {
        postData = data[0].data.children[0].data;
      }
      
      if (postData) {
        postContent = postData.selftext || postData.body || postData.text || '';
        
        // If it's a link post, include the URL
        if (!postContent && postData.url) {
          postContent = `[External Link: ${postData.url}]`;
        }
      }
      
      console.log('Extracted content length:', postContent.length);
      
      return NextResponse.json({
        content: postContent,
        title: postData?.title || '',
        author: postData?.author || '',
        subreddit: postData?.subreddit || '',
        score: postData?.score || 0,
        num_comments: postData?.num_comments || 0,
        created_utc: postData?.created_utc || null,
        url: postData?.url || url,
        is_self: postData?.is_self ?? true,
      });
    } catch (parseError) {
      console.error('Failed to parse post details response:', parseError);
      console.log('Response was:', responseText.substring(0, 500));
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in post details API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post details' },
      { status: 500 }
    );
  }
}