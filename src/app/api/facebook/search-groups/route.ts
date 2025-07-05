import { NextRequest, NextResponse } from 'next/server';

// Helper function to fetch profile details (and get the numeric ID)
async function fetchProfileDetails(profileUrl: string): Promise<{ id: string } | null> {
  // Prevent fetching for invalid or non-Facebook URLs
  if (!profileUrl || !profileUrl.includes('facebook.com')) {
    return null;
  }
  
  const url = `https://${process.env.RAPIDAPI_FACEBOOK_HOST}/profile/details_url?url=${encodeURIComponent(profileUrl)}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
        'x-rapidapi-host': process.env.RAPIDAPI_FACEBOOK_HOST!
      }
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch profile details for ${profileUrl}, status: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    // The API returns an object with an 'id' field
    return data && data.id ? { id: data.id } : null;

  } catch (error) {
    console.error(`Error in fetchProfileDetails for ${profileUrl}:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { groups, keywords, sorting_order, page, per_page, days_back = 90 } = body;

  console.log('API Route - Received request:', { groups, keywords, sorting_order, page, per_page, days_back });

  try {
    const allPosts = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days_back);

    for (const group of groups) {
      let hasMorePosts = true;
      let nextCursor = null;

      while (hasMorePosts) {
        let url = `https://${process.env.RAPIDAPI_FACEBOOK_HOST}/group/posts?group_id=${group.id}&sorting_order=${sorting_order}`;
        if (nextCursor) url += `&cursor=${nextCursor}`;
        
        const response = await fetch(url, {
          headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
            'x-rapidapi-host': process.env.RAPIDAPI_FACEBOOK_HOST!
          }
        });

        if (!response.ok) {
          console.error(`API Error for group ${group.name}`);
          break;
        }

        const data = await response.json();
        const posts = data.posts || data.data || (Array.isArray(data) ? data : []);
        nextCursor = data.paging?.cursors?.after || data.next_cursor || null;
        hasMorePosts = !!nextCursor && posts.length > 0;

        if (posts.length === 0) break;

        // --- NEW: Enrich posts with Author ID for messaging ---
        const profileUrlsToFetch = new Set<string>();
        posts.forEach(post => {
            if (post.author?.profile_url && !post.author.id) {
                profileUrlsToFetch.add(post.author.profile_url);
            }
        });

        const profileDetailsCache = new Map<string, { id: string }>();
        if (profileUrlsToFetch.size > 0) {
            const promises = Array.from(profileUrlsToFetch).map(url => fetchProfileDetails(url));
            const results = await Promise.allSettled(promises);
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    const originalUrl = Array.from(profileUrlsToFetch)[index];
                    profileDetailsCache.set(originalUrl, result.value);
                }
            });
        }
        // --- END: Enrichment logic ---

        const filteredAndMappedPosts = posts.filter(post => {
           
            if (!keywords || keywords.length === 0) return true;
            const postText = (post.text || post.message || '').toLowerCase();
            return keywords.some(keyword => postText.includes(keyword.toLowerCase()));
        }).map(post => {
            // Enrich author with the fetched numeric ID if available
            const authorId = post.author?.id || profileDetailsCache.get(post.author?.profile_url)?.id;

            return {
                id: post.id || `${group.id}-${Date.now()}-${Math.random()}`,
                text: post.text || post.message || post.content || '',
                author: {
                    id: authorId, // The crucial numeric ID for messaging
                    name: post.author?.name || post.from?.name || 'Facebook User',
                    profile_url: post.author?.profile_url || post.from?.link || null,
                    avatar_url: post.author?.avatar_url || post.from?.picture?.data?.url || null
                },
                timestamp: post.timestamp || post.created_time || post.updated_time,
                likes_count: post.likes_count || 0,
                comments_count: post.comments_count || 0,
                shares_count: post.shares_count || 0,
                group: { id: group.id, name: group.name },
                link: post.link || post.permalink, // permalink is often the direct post URL
            };
        });

        allPosts.push(...filteredAndMappedPosts);

        if (posts.length < 10) hasMorePosts = false;
      }
    }

    allPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const startIndex = (page - 1) * per_page;
    const paginatedPosts = allPosts.slice(startIndex, startIndex + per_page);

    return NextResponse.json({
      posts: paginatedPosts,
      pagination: {
        page,
        per_page,
        total_entries: allPosts.length,
        total_pages: Math.ceil(allPosts.length / per_page)
      },
      meta: { /* ... */ }
    });
  } catch (error) {
    console.error('Main API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}