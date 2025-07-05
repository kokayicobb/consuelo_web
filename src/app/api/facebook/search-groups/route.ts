import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { groups, keywords, sorting_order, page, per_page, days_back = 90 } = body;

  console.log('API Route - Received request:', { groups, keywords, page, days_back });

  try {
    const allPosts = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days_back);

    for (const group of groups) {
      let hasMorePosts = true;
      let nextCursor = null;

      // Set a hard limit on pages to fetch per group to prevent timeouts
      const MAX_PAGES_PER_GROUP = 5; 
      for (let pageNum = 0; pageNum < MAX_PAGES_PER_GROUP && hasMorePosts; pageNum++) {
        let url = `https://${process.env.RAPIDAPI_FACEBOOK_HOST}/group/posts?group_id=${group.id}&sorting_order=${sorting_order}`;
        if (nextCursor) {
          url += `&cursor=${nextCursor}`;
        }
        
        const response = await fetch(url, {
          headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
            'x-rapidapi-host': process.env.RAPIDAPI_FACEBOOK_HOST!,
          },
        });

        if (!response.ok) {
          console.error(`API Error for group ${group.name} (Status: ${response.status})`);
          break; // Stop fetching for this group
        }

        const data = await response.json();
        const posts = data.posts || data.data || (Array.isArray(data) ? data : []);
        
        nextCursor = data.paging?.cursors?.after || data.next_cursor || null;
        hasMorePosts = !!nextCursor && posts.length > 0;

        if (posts.length === 0) break;
        
        // REMOVED: The slow, post-by-post author detail fetching logic.
        // This is the key change to prevent timeouts.

        const filteredAndMappedPosts = posts.filter(post => {
            // Keep your date filtering logic if it was working
            const postDate = new Date(post.timestamp || post.created_time);
            if (postDate < startDate || postDate > endDate) return false;

            if (!keywords || keywords.length === 0) return true;
            const postText = (post.text || post.message || '').toLowerCase();
            return keywords.some(keyword => postText.includes(keyword.toLowerCase()));
        }).map(post => ({
            id: post.id || `${group.id}-${Date.now()}-${Math.random()}`,
            text: post.text || post.message || post.content || '',
            author: {
                // We accept that the API doesn't give us a reliable ID or profile URL here
                id: null,
                profile_url: null, 
                name: post.author?.name || post.from?.name || 'Facebook User',
                avatar_url: post.author?.avatar_url || post.from?.picture?.data?.url || null,
            },
            timestamp: post.timestamp || post.created_time || post.updated_time,
            likes_count: post.likes_count || 0,
            comments_count: post.comments_count || 0,
            shares_count: post.shares_count || 0,
            group: { id: group.id, name: group.name },
            link: post.link || post.permalink, // This permalink is reliable
        }));

        allPosts.push(...filteredAndMappedPosts);
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
        total_pages: Math.ceil(allPosts.length / per_page),
      },
    });
  } catch (error) {
    console.error('Main API error:', error);
    // Send a proper JSON error response
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}