import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { subreddits, keywords, sort_type, time_filter, page = 1, per_page = 10 } = body

  console.log("🚀 Reddit API Route - Received request:", { subreddits, keywords, sort_type, time_filter, page })

  if (!process.env.RAPIDAPI_KEY) {
    return NextResponse.json(
      { error: "API configuration missing. Please check environment variables." },
      { status: 500 },
    )
  }

  try {
    const allPosts: any[] = []
    const errors: any[] = []
    const apiLogs: any[] = []

    // Create search query
    const searchQuery = keywords.join(" ")
    console.log("🔍 Search query:", searchQuery)

    if (subreddits && subreddits.length > 0) {
      // Try multiple approaches for subreddit-specific search
      for (const subreddit of subreddits) {
        console.log(`\n📍 Processing subreddit: r/${subreddit}`)

        const approaches = [
          {
            name: "Standard subreddit parameter",
            url: `https://reddit3.p.rapidapi.com/v1/reddit/search?search=${encodeURIComponent(searchQuery)}&subreddit=${encodeURIComponent(subreddit)}&filter=posts&timeFilter=${time_filter}&sortType=${sort_type}`,
          },
          {
            name: "Subreddit with r/ prefix",
            url: `https://reddit3.p.rapidapi.com/v1/reddit/search?search=${encodeURIComponent(searchQuery)}&subreddit=${encodeURIComponent("r/" + subreddit)}&filter=posts&timeFilter=${time_filter}&sortType=${sort_type}`,
          },
          {
            name: "Subreddit in search query",
            url: `https://reddit3.p.rapidapi.com/v1/reddit/search?search=${encodeURIComponent(`subreddit:${subreddit} ${searchQuery}`)}&filter=posts&timeFilter=${time_filter}&sortType=${sort_type}`,
          },
          {
            name: "Alternative format",
            url: `https://reddit3.p.rapidapi.com/v1/reddit/search?q=${encodeURIComponent(searchQuery)}&subreddit=${encodeURIComponent(subreddit)}&type=posts&sort=${sort_type}&t=${time_filter}`,
          },
        ]

        let foundPosts = false

        for (const approach of approaches) {
          if (foundPosts) break // Skip remaining approaches if we found posts

          console.log(`\n🔄 Trying: ${approach.name}`)
          console.log(`📡 URL: ${approach.url}`)

          try {
            const startTime = Date.now()

            const response = await fetch(approach.url, {
              method: "GET",
              headers: {
                "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
                "x-rapidapi-host": "reddit3.p.rapidapi.com",
                "User-Agent": "RedditScraper/1.0",
              },
            })

            const responseTime = Date.now() - startTime
            console.log(`⏱️  Response time: ${responseTime}ms`)
            console.log(`📊 Status: ${response.status} ${response.statusText}`)
            console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()))

            // Log the raw response first
            const responseText = await response.text()
            console.log(`📄 Response length: ${responseText.length} characters`)
            console.log(`📝 Response preview (first 500 chars):`, responseText.substring(0, 500))

            const logEntry = {
              subreddit,
              approach: approach.name,
              url: approach.url,
              status: response.status,
              responseTime,
              responseLength: responseText.length,
              responsePreview: responseText.substring(0, 200),
              success: false,
              postsFound: 0,
            }

            if (response.ok) {
              try {
                // Try to parse as JSON
                const data = JSON.parse(responseText)
                console.log(`✅ JSON parsed successfully`)
                console.log(`🏗️  Response structure:`, Object.keys(data))

                if (data.body && Array.isArray(data.body)) {
                  console.log(`📦 Found ${data.body.length} posts in response`)

                  // Log sample post structure
                  if (data.body.length > 0) {
                    const samplePost = data.body[0]
                    console.log(`📋 Sample post structure:`, Object.keys(samplePost))
                    console.log(`📋 Sample post subreddit field:`, samplePost.subreddit)
                    console.log(`📋 Sample post title:`, samplePost.title?.substring(0, 100))
                  }

                  const filteredPosts = data.body.filter((post) => {
                    const postSubreddit = post.subreddit || post.subreddit_name_prefixed || ""
                    const cleanPostSubreddit = postSubreddit.replace(/^r\//, "").toLowerCase()
                    const targetSubreddit = subreddit.toLowerCase()
                    const matches = cleanPostSubreddit === targetSubreddit

                    if (!matches) {
                      console.log(`🚫 Filtering out: r/${cleanPostSubreddit} (expected: r/${targetSubreddit})`)
                    }

                    return matches
                  })

                  console.log(`✨ Filtered posts: ${filteredPosts.length} from r/${subreddit}`)

                  if (filteredPosts.length > 0) {
                    console.log(`🎉 SUCCESS: Found ${filteredPosts.length} posts from r/${subreddit}`)
                    allPosts.push(...filteredPosts)
                    foundPosts = true
                    logEntry.success = true
                    logEntry.postsFound = filteredPosts.length
                  }
                } else {
                  console.log(`❌ No 'body' array found in response`)
                  console.log(`🔍 Available fields:`, Object.keys(data))
                }
              } catch (jsonError) {
                console.log(`❌ JSON parsing failed:`, jsonError.message)
                console.log(`🔍 Response appears to be HTML or other format`)

                // Check if it's an HTML error page
                if (responseText.includes("<!doctype") || responseText.includes("<html")) {
                  console.log(`🌐 Response is HTML - likely an error page`)

                  // Try to extract error message from HTML
                  const titleMatch = responseText.match(/<title>(.*?)<\/title>/i)
                  if (titleMatch) {
                    console.log(`📄 HTML Title:`, titleMatch[1])
                  }
                }
              }
            } else {
              console.log(`❌ HTTP Error: ${response.status}`)
              console.log(`📄 Error response:`, responseText.substring(0, 1000))
            }

            apiLogs.push(logEntry)
          } catch (fetchError) {
            console.log(`💥 Fetch error:`, fetchError.message)
            errors.push({
              subreddit,
              approach: approach.name,
              error: fetchError instanceof Error ? fetchError.message : "Unknown fetch error",
            })
          }

          // Rate limiting between attempts
          await new Promise((resolve) => setTimeout(resolve, 1500))
        }

        if (!foundPosts) {
          console.log(`😞 No posts found for r/${subreddit} with any approach`)
          errors.push({ subreddit, error: "No posts found with any search approach" })
        }

        // Longer delay between subreddits
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    } else {
      // Sitewide search with enhanced logging
      console.log(`\n🌍 Performing sitewide search`)

      const sitewideUrl = `https://reddit3.p.rapidapi.com/v1/reddit/search?search=${encodeURIComponent(searchQuery)}&filter=posts&timeFilter=${time_filter}&sortType=${sort_type}`
      console.log(`📡 Sitewide URL: ${sitewideUrl}`)

      try {
        const response = await fetch(sitewideUrl, {
          method: "GET",
          headers: {
            "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
            "x-rapidapi-host": "reddit3.p.rapidapi.com",
          },
        })

        console.log(`📊 Sitewide status: ${response.status}`)
        const responseText = await response.text()
        console.log(`📄 Sitewide response length: ${responseText.length}`)

        if (response.ok) {
          try {
            const data = JSON.parse(responseText)
            if (data.body && Array.isArray(data.body)) {
              console.log(`🌍 Sitewide found: ${data.body.length} posts`)

              const keywordFilteredPosts = data.body.filter((post) => {
                const text = `${post.title || ""} ${post.selftext || ""}`.toLowerCase()
                return keywords.some((keyword) => text.includes(keyword.toLowerCase()))
              })

              console.log(`✨ Keyword filtered: ${keywordFilteredPosts.length} posts`)
              allPosts.push(...keywordFilteredPosts)
            }
          } catch (jsonError) {
            console.log(`❌ Sitewide JSON parsing failed:`, jsonError.message)
          }
        }
      } catch (error) {
        console.error("💥 Sitewide search error:", error)
      }
    }

    // Remove duplicates
    const uniquePostsMap = new Map()
    for (const post of allPosts) {
      if (post && post.id && !uniquePostsMap.has(post.id)) {
        uniquePostsMap.set(post.id, post)
      }
    }

    const uniquePosts = Array.from(uniquePostsMap.values())
    console.log(`\n🔄 Total unique posts after deduplication: ${uniquePosts.length}`)

    // Additional keyword filtering
    const keywordFilteredPosts = uniquePosts.filter((post) => {
      const text = `${post.title || ""} ${post.selftext || ""}`.toLowerCase()
      const hasKeywords = keywords.some((keyword) => text.includes(keyword.toLowerCase()))

      if (!hasKeywords) {
        console.log(`🚫 Filtering out post (no keywords): ${post.title?.substring(0, 50)}...`)
      }

      return hasKeywords
    })

    console.log(`✨ Posts after final keyword filtering: ${keywordFilteredPosts.length}`)

    // Transform posts (keeping existing transformation logic)
    const transformedPosts = keywordFilteredPosts.map((post) => {
      let timestamp
      if (post.created_utc) {
        timestamp = new Date(post.created_utc * 1000).toISOString()
      } else if (post.created) {
        timestamp = new Date(post.created * 1000).toISOString()
      } else if (post.createdAt) {
        timestamp = new Date(post.createdAt).toISOString()
      } else {
        timestamp = new Date().toISOString()
      }

      let subredditName = post.subreddit || post.subreddit_name_prefixed || ""
      if (subredditName.startsWith("r/")) {
        subredditName = subredditName.substring(2)
      }

      let permalink = post.permalink
      if (!permalink && post.id && subredditName) {
        permalink = `/r/${subredditName}/comments/${post.id}/`
      }

      return {
        id: post.id || `post_${Date.now()}_${Math.random()}`,
        title: post.title || "No title",
        text: post.selftext || post.body || post.text || "",
        author: {
          name: post.author || post.author_fullname || "[deleted]",
          profile_url: post.author && post.author !== "[deleted]" ? `https://www.reddit.com/user/${post.author}` : "#",
        },
        subreddit: {
          name: subredditName || "unknown",
          url: subredditName ? `https://www.reddit.com/r/${subredditName}` : "#",
        },
        timestamp,
        score: Number.parseInt(post.score) || Number.parseInt(post.ups) || 0,
        num_comments: Number.parseInt(post.num_comments) || Number.parseInt(post.num_comments_count) || 0,
        permalink: permalink || "",
        url: post.url || "",
        is_self: post.is_self !== undefined ? post.is_self : !post.url || post.url === post.permalink,
      }
    })

    // Sort and paginate (keeping existing logic)
    if (sort_type === "new") {
      transformedPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } else if (sort_type === "top" || sort_type === "relevance") {
      transformedPosts.sort((a, b) => b.score - a.score)
    } else if (sort_type === "comments") {
      transformedPosts.sort((a, b) => b.num_comments - a.num_comments)
    }

    const startIndex = (page - 1) * per_page
    const paginatedPosts = transformedPosts.slice(startIndex, startIndex + per_page)

    console.log(`\n🎯 Final results: ${paginatedPosts.length} posts returned`)

    if (paginatedPosts.length > 0) {
      console.log(`📋 Sample result:`)
      console.log(`   Title: ${paginatedPosts[0].title}`)
      console.log(`   Subreddit: r/${paginatedPosts[0].subreddit.name}`)
      console.log(`   Author: u/${paginatedPosts[0].author.name}`)
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
        total_after_filtering: transformedPosts.length,
        errors: errors.length > 0 ? errors : undefined,
        api_logs: apiLogs, // Include detailed API logs
      },
    })
  } catch (error) {
    console.error("💥 Reddit API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch Reddit posts. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
