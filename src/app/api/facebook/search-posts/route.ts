// src/app/api/facebook/search-posts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { query, start_date, end_date, page = 1 } = body;

  console.log('Search Posts API - Request:', { query, start_date, end_date, page });

  try {
    // Build search URL
    let url = `https://${process.env.RAPIDAPI_FACEBOOK_HOST}/search/posts?query=${encodeURIComponent(query)}`;
    
    // Add date filters if provided
    if (start_date) {
      url += `&start_date=${start_date}`;
    }
    if (end_date) {
      url += `&end_date=${end_date}`;
    }
    
    // Add pagination
    if (page > 1) {
      url += `&page=${page}`;
    }

    console.log('Fetching from:', url);

    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
        'x-rapidapi-host': process.env.RAPIDAPI_FACEBOOK_HOST!
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Search response keys:', Object.keys(data));

    // Process search results
    const posts = Array.isArray(data) ? data : (data.posts || data.data || []);
    
    const processedPosts = posts.map(post => ({
      id: post.id || `search-${Date.now()}-${Math.random()}`,
      text: post.text || post.message || post.content || '',
      author: {
        id: post.author?.id || post.from?.id || '',
        name: post.author?.name || post.from?.name || 'Facebook User',
        profile_url: post.author?.profile_url || post.from?.link || null,
        avatar_url: post.author?.avatar_url || post.from?.picture?.data?.url || null
      },
      timestamp: post.timestamp || post.created_time || new Date().toISOString(),
      likes_count: post.likes_count || post.reactions?.summary?.total_count || 0,
      comments_count: post.comments_count || post.comments?.summary?.total_count || 0,
      shares_count: post.shares_count || post.shares?.count || 0,
      group: post.group || { id: 'unknown', name: 'Unknown Group' },
      page: post.page || null,
      images: post.images || [],
      link: post.link || null,
      type: post.type || 'text'
    }));

    return NextResponse.json({
      success: true,
      posts: processedPosts,
      pagination: {
        page,
        total: processedPosts.length,
        has_more: data.has_more || false
      }
    });

  } catch (error) {
    console.error('Search Posts API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}