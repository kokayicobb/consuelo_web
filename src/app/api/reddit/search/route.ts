// app/api/reddit/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface RedditPostData {
  id: string;
  title: string;
  selftext?: string;
  author: string;
  subreddit: string;
  created_utc: number;
  score: number;
  num_comments: number;
  permalink: string;
  url?: string;
  is_self: boolean;
  thumbnail?: string;
  preview?: {
    images: Array<{
      source: { url: string };
    }>;
  };
}

interface RedditSearchResponse {
  data?: RedditPostData[];
  posts?: RedditPostData[];
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { subreddits, keywords, sort_type, time_filter, page, per_page } = body;

  console.log('Reddit API Route - Received request:', { subreddits, keywords, sort_type, time_filter, page });

  try {
    const allPosts: any[] = [];
    
    // If no subreddits specified, search sitewide
    if (!subreddits || subreddits.length === 0) {
      // Search sitewide for each keyword
      for (const keyword of keywords) {
        const url = `https://${process.env.RAPIDAPI_REDDIT_HOST}/v1/search?search=${encodeURIComponent(keyword)}&filter=posts&timeFilter=${time_filter}&sortType=${sort_type}`;
        
        const response = await fetch(url, {
          headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
            'x-rapidapi-host': process.env.RAPIDAPI_REDDIT_HOST!,
          },
        });

        if (!response.ok) {
          console.error(`Reddit API Error (Status: ${response.status})`);
          continue;
        }

        const data: RedditSearchResponse = await response.json();
        const posts = data.data || data.posts || [];
        allPosts.push(...posts);
      }
    } else {
      // Search within specific subreddits
      for (const subreddit of subreddits) {
        for (const keyword of keywords) {
          const url = `https://${process.env.RAPIDAPI_REDDIT_HOST}/v1/search?search=${encodeURIComponent(keyword)}&subreddit=${subreddit}&filter=posts&timeFilter=${time_filter}&sortType=${sort_type}`;
          
          const response = await fetch(url, {
            headers: {
              'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
              'x-rapidapi-host': process.env.RAPIDAPI_REDDIT_HOST!,
            },
          });

          if (!response.ok) {
            console.error(`Reddit API Error for r/${subreddit} (Status: ${response.status})`);
            continue;
          }

          const data: RedditSearchResponse = await response.json();
          const posts = data.data || data.posts || [];
          allPosts.push(...posts);
        }
      }
    }

    // Remove duplicates based on post ID
    const uniquePosts = Array.from(
      new Map(allPosts.map(post => [post.id, post])).values()
    );

    // Transform posts to our format
    const transformedPosts = uniquePosts.map(post => ({
      id: post.id,
      title: post.title,
      text: post.selftext || '',
      author: {
        name: post.author,
        profile_url: `https://www.reddit.com/user/${post.author}`,
        karma: null, // API doesn't provide this in search results
      },
      subreddit: {
        name: post.subreddit,
        url: `https://www.reddit.com/r/${post.subreddit}`,
      },
      timestamp: new Date(post.created_utc * 1000).toISOString(),
      score: post.score,
      num_comments: post.num_comments,
      permalink: post.permalink,
      url: post.url,
      is_self: post.is_self,
      thumbnail: post.thumbnail,
      preview: post.preview,
    }));

    // Sort by timestamp (most recent first)
    transformedPosts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Paginate results
    const startIndex = (page - 1) * per_page;
    const paginatedPosts = transformedPosts.slice(startIndex, startIndex + per_page);

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
      },
    });
  } catch (error) {
    console.error('Reddit API error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}