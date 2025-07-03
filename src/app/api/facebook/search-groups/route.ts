// src/app/api/facebook/search-groups/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { groups, keywords, sorting_order, page, per_page } = body;

  console.log('API Route - Received request:', { 
    groups, 
    keywords, 
    sorting_order, 
    page, 
    per_page,
    env: {
      host: process.env.RAPIDAPI_FACEBOOK_HOST,
      hasKey: !!process.env.RAPIDAPI_KEY
    }
  });

  try {
    const allPosts = [];
    
    // Fetch posts from each group
    for (const group of groups) {
      try {
        const url = `https://${process.env.RAPIDAPI_FACEBOOK_HOST}/group/posts?group_id=${group.id}&sorting_order=${sorting_order}`;
        console.log(`Fetching from: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
            'x-rapidapi-host': process.env.RAPIDAPI_FACEBOOK_HOST!
          }
        });
        
        console.log(`Response status for group ${group.name}: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error for group ${group.name}:`, errorText);
          continue; // Skip this group but continue with others
        }
        
        const data = await response.json();
        console.log(`Raw data for group ${group.name}:`, JSON.stringify(data).slice(0, 200));
        
        // Handle different possible response structures
        let posts = [];
        if (Array.isArray(data)) {
          posts = data;
        } else if (data.posts && Array.isArray(data.posts)) {
          posts = data.posts;
        } else if (data.data && Array.isArray(data.data)) {
          posts = data.data;
        }
        
        console.log(`Found ${posts.length} posts in group ${group.name}`);
        
        // Filter and map posts
        const filteredPosts = posts.filter(post => {
          const postText = (post.text || post.message || post.content || '').toLowerCase();
          return keywords.some(keyword => 
            postText.includes(keyword.toLowerCase())
          );
        }).map(post => ({
          id: post.id || `${group.id}-${Date.now()}-${Math.random()}`,
          text: post.text || post.message || post.content || '',
          author: {
            name: post.author?.name || post.from?.name || 'Facebook User',
            profile_url: post.author?.profile_url || post.from?.link || null,
            avatar_url: post.author?.avatar_url || post.from?.picture?.data?.url || null
          },
          timestamp: post.timestamp || post.created_time || post.updated_time || new Date().toISOString(),
          likes_count: post.likes_count || post.reactions?.summary?.total_count || 0,
          comments_count: post.comments_count || post.comments?.summary?.total_count || 0,
          shares_count: post.shares_count || post.shares?.count || 0,
          group: {
            id: group.id,
            name: group.name
          },
          images: post.images || post.attachments?.data?.filter(a => a.type === 'photo').map(a => a.media?.image?.src) || [],
          link: post.link || post.attachments?.data?.[0]?.url || null,
          type: post.type || 'text'
        }));
        
        console.log(`Filtered to ${filteredPosts.length} posts with keywords`);
        allPosts.push(...filteredPosts);
        
      } catch (groupError) {
        console.error(`Error processing group ${group.name}:`, groupError);
        // Continue with other groups
      }
    }
    
    console.log(`Total posts collected: ${allPosts.length}`);
    
    // Sort by timestamp (newest first)
    allPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Pagination
    const startIndex = (page - 1) * per_page;
    const paginatedPosts = allPosts.slice(startIndex, startIndex + per_page);
    
    console.log(`Returning ${paginatedPosts.length} posts for page ${page}`);
    
    return NextResponse.json({
      posts: paginatedPosts,
      pagination: {
        page,
        per_page,
        total_entries: allPosts.length,
        total_pages: Math.ceil(allPosts.length / per_page)
      }
    });
  } catch (error) {
    console.error('Main API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}