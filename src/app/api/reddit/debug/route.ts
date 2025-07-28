import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testType = searchParams.get("test") || "basic"

  if (!process.env.RAPIDAPI_KEY) {
    return NextResponse.json({ error: "API key missing" }, { status: 500 })
  }

  console.log(`🧪 Starting Reddit API debug test: ${testType}`)

  const results: any[] = []

  try {
    const testCases = [
      {
        name: "Basic search",
        url: "https://reddit3.p.rapidapi.com/v1/reddit/search?search=help&filter=posts&sortType=new&timeFilter=week",
      },
      {
        name: "Subreddit parameter",
        url: "https://reddit3.p.rapidapi.com/v1/reddit/search?search=help&subreddit=startups&filter=posts&sortType=new&timeFilter=week",
      },
      {
        name: "Alternative endpoint 1",
        url: "https://reddit3.p.rapidapi.com/v1/posts/search?q=help&subreddit=startups&sort=new&t=week",
      },
      {
        name: "Alternative endpoint 2",
        url: "https://reddit3.p.rapidapi.com/search?q=help&subreddit=startups&type=posts",
      },
      {
        name: "Different host test",
        url: "https://reddit-scraper.p.rapidapi.com/search?query=help&subreddit=startups",
      },
    ]

    for (const testCase of testCases) {
      console.log(`\n🔍 Testing: ${testCase.name}`)
      console.log(`📡 URL: ${testCase.url}`)

      const result = {
        name: testCase.name,
        url: testCase.url,
        success: false,
        status: 0,
        error: null,
        responseType: "unknown",
        dataStructure: {},
        sampleData: null,
      }

      try {
        const startTime = Date.now()

        const response = await fetch(testCase.url, {
          method: "GET",
          headers: {
            "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
            "x-rapidapi-host": testCase.url.includes("reddit3.p.rapidapi.com")
              ? "reddit3.p.rapidapi.com"
              : "reddit-scraper.p.rapidapi.com",
            "User-Agent": "RedditDebugger/1.0",
          },
        })

        const responseTime = Date.now() - startTime
        result.status = response.status

        console.log(`📊 Status: ${response.status} (${responseTime}ms)`)
        console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()))

        const responseText = await response.text()
        console.log(`📄 Response length: ${responseText.length}`)
        console.log(`📝 First 300 chars:`, responseText.substring(0, 300))

        if (response.ok) {
          try {
            const data = JSON.parse(responseText)
            result.success = true
            result.responseType = "json"
            result.dataStructure = Object.keys(data)

            console.log(`✅ JSON Response structure:`, Object.keys(data))

            // Look for posts in various possible locations
            const possiblePostArrays = ["body", "data", "posts", "results", "items"]
            let postsFound = false

            for (const key of possiblePostArrays) {
              if (data[key] && Array.isArray(data[key])) {
                console.log(`📦 Found posts array at '${key}': ${data[key].length} items`)

                if (data[key].length > 0) {
                  const samplePost = data[key][0]
                  console.log(`📋 Sample post keys:`, Object.keys(samplePost))
                  console.log(
                    `📋 Sample subreddit:`,
                    samplePost.subreddit || samplePost.subreddit_name_prefixed || "not found",
                  )
                  console.log(`📋 Sample title:`, samplePost.title?.substring(0, 100) || "no title")

                  result.sampleData = {
                    postsArrayKey: key,
                    postCount: data[key].length,
                    samplePostKeys: Object.keys(samplePost),
                    sampleSubreddit: samplePost.subreddit || samplePost.subreddit_name_prefixed,
                    sampleTitle: samplePost.title?.substring(0, 100),
                  }
                }
                postsFound = true
                break
              }
            }

            if (!postsFound) {
              console.log(`❌ No posts array found in response`)
            }
          } catch (jsonError) {
            result.responseType = responseText.includes("<!doctype") ? "html" : "text"
            result.error = `JSON parse error: ${jsonError.message}`
            console.log(`❌ JSON parsing failed:`, jsonError.message)

            if (responseText.includes("<!doctype")) {
              console.log(`🌐 Response is HTML`)
              const titleMatch = responseText.match(/<title>(.*?)<\/title>/i)
              if (titleMatch) {
                console.log(`📄 HTML Title: ${titleMatch[1]}`)
                result.error += ` | HTML Title: ${titleMatch[1]}`
              }
            }
          }
        } else {
          result.error = `HTTP ${response.status}: ${responseText.substring(0, 200)}`
          console.log(`❌ HTTP Error: ${response.status}`)
        }
      } catch (fetchError) {
        result.error = fetchError.message
        console.log(`💥 Fetch error:`, fetchError.message)
      }

      results.push(result)

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    console.log(`\n🎯 Debug test completed. Results summary:`)
    results.forEach((result) => {
      console.log(`   ${result.name}: ${result.success ? "✅" : "❌"} (${result.status})`)
    })

    return NextResponse.json({
      success: true,
      testType,
      results,
      summary: {
        totalTests: results.length,
        successfulTests: results.filter((r) => r.success).length,
        failedTests: results.filter((r) => !r.success).length,
      },
    })
  } catch (error) {
    console.error("💥 Debug test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        results,
      },
      { status: 500 },
    )
  }
}
