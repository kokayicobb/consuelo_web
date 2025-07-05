// app/api/reddit/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { subreddits, keywords, sort_type, time_filter, page = 1, per_page = 10 } = body;

  console.log('Reddit API Route - Received request:', { subreddits, keywords, sort_type, time_filter, page });

  if (!process.env.RAPIDAPI_KEY) {
    return NextResponse.json(
      { error: 'API configuration missing. Please check environment variables.' },
      { status: 500 }
    );
  }

  try {
    const allPosts: any[] = [];
    const errors: any[] = [];
    
    // Create search query
    const searchQuery = keywords.join(' ');
    
    if (subreddits && subreddits.length > 0) {
      // Search within specific subreddits
      for (const subreddit of subreddits) {
        try {
          const url = `https://reddit3.p.rapidapi.com/v1/reddit/search?` + 
            `search=${encodeURIComponent(searchQuery)}` +
            `&subreddit=${encodeURIComponent(subreddit)}` +
            `&filter=posts` +
            `&timeFilter=${time_filter}` +
            `&sortType=${sort_type}`;
          
          console.log(`Searching in r/${subreddit}:`, url);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'x-rapidapi-key': process.env.RAPIDAPI_KEY,
              'x-rapidapi-host': 'reddit3.p.rapidapi.com'
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`Response structure for r/${subreddit}:`, Object.keys(data));
            
            // Extract posts from the body field
            if (data.body && Array.isArray(data.body)) {
              console.log(`Found ${data.body.length} posts in r/${subreddit}`);
              allPosts.push(...data.body);
              
              // Log sample post to understand structure
              if (data.body.length > 0) {
                console.log('Sample post structure:', Object.keys(data.body[0]));
                console.log('Sample post:', JSON.stringify(data.body[0]).substring(0, 500));
              }
            } else {
              console.log(`No posts found in body for r/${subreddit}`);
              console.log('Full response:', JSON.stringify(data).substring(0, 500));
            }
          } else {
            console.error(`Error searching r/${subreddit}: ${response.status}`);
            const errorText = await response.text();
            console.error('Error response:', errorText.substring(0, 200));
            errors.push({ subreddit, status: response.status });
          }
          
          // Delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error processing r/${subreddit}:`, error);
          errors.push({ subreddit, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }
    } else {
      // Sitewide search
      try {
        const url = `https://reddit3.p.rapidapi.com/v1/reddit/search?` + 
          `search=${encodeURIComponent(searchQuery)}` +
          `&filter=posts` +
          `&timeFilter=${time_filter}` +
          `&sortType=${sort_type}`;
        
        console.log('Sitewide search:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'reddit3.p.rapidapi.com'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.body && Array.isArray(data.body)) {
            console.log(`Found ${data.body.length} posts from sitewide search`);
            allPosts.push(...data.body);
          }
        } else {
          console.error(`Sitewide search error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error in sitewide search:', error);
      }
    }

    // Remove duplicates
    const uniquePostsMap = new Map();
    for (const post of allPosts) {
      if (post && post.id && !uniquePostsMap.has(post.id)) {
        uniquePostsMap.set(post.id, post);
      }
    }
    const uniquePosts = Array.from(uniquePostsMap.values());

    console.log(`Total unique posts: ${uniquePosts.length}`);

    // Transform posts to our format
    const transformedPosts = uniquePosts.map(post => {
      // Parse timestamp - Reddit uses seconds since epoch
      let timestamp;
      if (post.created_utc) {
        timestamp = new Date(post.created_utc * 1000).toISOString();
      } else if (post.created) {
        timestamp = new Date(post.created * 1000).toISOString();
      } else if (post.createdAt) {
        timestamp = new Date(post.createdAt).toISOString();
      } else {
        timestamp = new Date().toISOString();
      }

      // Extract subreddit name
      let subredditName = post.subreddit || post.subreddit_name_prefixed || '';
      if (subredditName.startsWith('r/')) {
        subredditName = subredditName.substring(2);
      }

      // Build permalink if not provided
      let permalink = post.permalink;
      if (!permalink && post.id && subredditName) {
        permalink = `/r/${subredditName}/comments/${post.id}/`;
      }

      // Clean up preview images
      let preview = null;
      if (post.preview?.images?.length > 0) {
        preview = {
          images: post.preview.images.map((img: any) => ({
            source: {
              url: img.source?.url || img.url || ''
            }
          }))
        };
      }

      // Extract thumbnail
      let thumbnail = null;
      if (post.thumbnail && 
          typeof post.thumbnail === 'string' &&
          post.thumbnail !== 'self' && 
          post.thumbnail !== 'default' && 
          post.thumbnail !== 'nsfw' &&
          post.thumbnail !== 'spoiler' &&
          post.thumbnail.startsWith('http')) {
        thumbnail = post.thumbnail;
      }

      return {
        id: post.id || `post_${Date.now()}_${Math.random()}`,
        title: post.title || 'No title',
        text: post.selftext || post.body || post.text || '',
        author: {
          name: post.author || post.author_fullname || '[deleted]',
          profile_url: post.author && post.author !== '[deleted]' 
            ? `https://www.reddit.com/user/${post.author}` 
            : '#',
        },
        subreddit: {
          name: subredditName || 'unknown',
          url: subredditName ? `https://www.reddit.com/r/${subredditName}` : '#',
        },
        timestamp,
        score: parseInt(post.score) || parseInt(post.ups) || 0,
        num_comments: parseInt(post.num_comments) || parseInt(post.num_comments_count) || 0,
        permalink: permalink || '',
        url: post.url || '',
        is_self: post.is_self !== undefined ? post.is_self : !post.url || post.url === post.permalink,
        thumbnail,
        preview,
      };
    });

    // Sort based on sort_type
    if (sort_type === 'new') {
      transformedPosts.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } else if (sort_type === 'top' || sort_type === 'relevance') {
      transformedPosts.sort((a, b) => b.score - a.score);
    } else if (sort_type === 'comments') {
      transformedPosts.sort((a, b) => b.num_comments - a.num_comments);
    }

    // Paginate results
    const startIndex = (page - 1) * per_page;
    const paginatedPosts = transformedPosts.slice(startIndex, startIndex + per_page);

    // Log first post for debugging
    if (paginatedPosts.length > 0) {
      console.log('First transformed post:', JSON.stringify(paginatedPosts[0], null, 2));
    }

    return NextResponse.json({
      posts: paginatedPosts,
      pagination: {
        page,
        per_page,
        total_entries: transformedPosts.length,
        total_pages: Math.ceil(transformedPosts.length / per_page),
      },
      meta: {
        subreddits_searched: subreddits || [],
        keywords_used: keywords,
        sort_type,
        time_filter,
        total_fetched: allPosts.length,
        total_unique: uniquePosts.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error('Reddit API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Reddit posts. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}