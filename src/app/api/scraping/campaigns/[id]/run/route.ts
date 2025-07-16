import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { neon } from "@neondatabase/serverless"
import FirecrawlApp from "@mendable/firecrawl-js"

const sql = neon(process.env.DATABASE_URL!)
const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! })

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const campaignId = params.id

    // Get user's internal ID
    const [user] = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId}
    `

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get campaign details with platform configurations
    const [campaign] = await sql`
      SELECT sc.*, u.credits_remaining
      FROM scraping_campaigns sc
      JOIN users u ON sc.user_id = u.id
      WHERE sc.id = ${campaignId} AND sc.user_id = ${user.id}
    `

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Check if user has enough credits
    if (campaign.credits_remaining < 10) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 })
    }

    // Get platform configurations
    const platformConfigs = await sql`
      SELECT * FROM platform_configurations 
      WHERE campaign_id = ${campaignId} AND is_active = true
    `

    // Create a new job
    const [job] = await sql`
      INSERT INTO scraping_jobs (campaign_id, job_type, status, platforms_to_scrape, started_at)
      VALUES (${campaignId}, 'manual', 'running', ${campaign.platforms}, NOW())
      RETURNING *
    `

    // Update campaign status and last_run_at
    await sql`
      UPDATE scraping_campaigns 
      SET status = 'active', last_run_at = NOW() 
      WHERE id = ${campaignId}
    `

    // Start scraping process in background
    runScrapingJob(job.id, campaign, platformConfigs).catch(console.error)

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Error running campaign:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function runScrapingJob(jobId: string, campaign: any, platformConfigs: any[]) {
  try {
    let totalLeadsFound = 0
    const stats = { leads_found: 0, pages_scraped: 0, errors: 0 }

    for (const platform of campaign.platforms) {
      const platformConfig = platformConfigs.find((pc) => pc.platform === platform)
      if (!platformConfig) continue

      try {
        const leads = await scrapePlatform(platform, campaign, platformConfig.config)

        // Insert leads into database
        for (const lead of leads) {
          const [insertedLead] = await sql`
            INSERT INTO scraped_leads (
              campaign_id, job_id, platform, full_name, email, company, title,
              location, linkedin_url, source_url, source_content, lead_score,
              status, enrichment_status, scraped_data
            ) VALUES (
              ${campaign.id}, ${jobId}, ${platform}, ${lead.full_name || null},
              ${lead.email || null}, ${lead.company || null}, ${lead.title || null},
              ${lead.location || null}, ${lead.linkedin_url || null}, ${lead.source_url},
              ${lead.source_content || null}, ${lead.lead_score || 0.5},
              'new', 'pending', ${JSON.stringify(lead.scraped_data || {})}
            ) RETURNING id
          `

          // Log successful lead creation
          await sql`
            INSERT INTO scraping_logs (job_id, campaign_id, platform, log_level, message, details)
            VALUES (${jobId}, ${campaign.id}, ${platform}, 'info', 'Lead created', ${JSON.stringify({ lead_id: insertedLead.id })})
          `
        }

        totalLeadsFound += leads.length
        stats.leads_found += leads.length
        stats.pages_scraped += 1
      } catch (platformError) {
        console.error(`Error scraping ${platform}:`, platformError)
        stats.errors += 1

        // Log error
        await sql`
          INSERT INTO scraping_logs (job_id, campaign_id, platform, log_level, message, details)
          VALUES (${jobId}, ${campaign.id}, ${platform}, 'error', 'Platform scraping failed', ${JSON.stringify({ error: platformError.message })})
        `
      }
    }

    // Update job status
    await sql`
      UPDATE scraping_jobs 
      SET status = 'completed', completed_at = NOW(), stats = ${JSON.stringify(stats)}
      WHERE id = ${jobId}
    `

    // Update campaign total leads
    await sql`
      UPDATE scraping_campaigns 
      SET total_leads_found = total_leads_found + ${totalLeadsFound}
      WHERE id = ${campaign.id}
    `

    // Deduct credits (1 credit per lead found)
    await sql`
      UPDATE users 
      SET credits_remaining = credits_remaining - ${totalLeadsFound}
      WHERE id = ${campaign.user_id}
    `
  } catch (error) {
    console.error("Error in scraping job:", error)

    await sql`
      UPDATE scraping_jobs 
      SET status = 'failed', error_message = ${error.message}, completed_at = NOW()
      WHERE id = ${jobId}
    `
  }
}

async function scrapeReddit(campaign: any, config: any) {
  const leads = []
  const subreddits = config.subreddits || ["entrepreneur", "startups"]

  for (const subreddit of subreddits) {
    try {
      const scrapeResult = await firecrawl.scrapeUrl(`https://reddit.com/r/${subreddit}/hot`, {
        formats: ["markdown"],
        actions: [
          { type: "wait", milliseconds: 2000 },
          { type: "scroll", direction: "down", amount: 3 },
          { type: "wait", milliseconds: 1000 },
        ],
      })

      if (scrapeResult.success && scrapeResult.markdown) {
        // Parse Reddit posts for potential leads
        const posts = parseRedditPosts(scrapeResult.markdown)

        for (const post of posts) {
          if (matchesKeywords(post.content, campaign.keywords)) {
            leads.push({
              full_name: post.author,
              source_url: `https://reddit.com${post.permalink}`,
              source_content: post.content,
              scraped_data: { subreddit, post_id: post.id },
              lead_score: calculateLeadScore(post, campaign),
            })
          }
        }
      }
    } catch (error) {
      console.error(`Error scraping r/${subreddit}:`, error)
    }
  }

  return leads
}

async function scrapeLinkedIn(campaign: any, config: any) {
  const leads = []
  const searchTerms = config.search_terms || campaign.keywords || []

  for (const term of searchTerms) {
    try {
      const searchUrl = `https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(term)}`

      const scrapeResult = await firecrawl.scrapeUrl(searchUrl, {
        formats: ["markdown"],
        actions: [
          { type: "wait", milliseconds: 3000 },
          { type: "scroll", direction: "down", amount: 2 },
          { type: "wait", milliseconds: 2000 },
        ],
      })

      if (scrapeResult.success && scrapeResult.markdown) {
        const profiles = parseLinkedInProfiles(scrapeResult.markdown)

        for (const profile of profiles) {
          leads.push({
            full_name: profile.name,
            title: profile.title,
            company: profile.company,
            location: profile.location,
            linkedin_url: profile.url,
            source_url: searchUrl,
            source_content: profile.snippet,
            scraped_data: { search_term: term },
            lead_score: calculateLeadScore(profile, campaign),
          })
        }
      }
    } catch (error) {
      console.error(`Error scraping LinkedIn for "${term}":`, error)
    }
  }

  return leads
}

async function scrapeWebsite(campaign: any, config: any) {
  const leads = []
  const urls = config.urls || []

  for (const url of urls) {
    try {
      const scrapeResult = await firecrawl.scrapeUrl(url, {
        formats: ["markdown", "json"],
        jsonOptions: {
          prompt: "Extract contact information including names, emails, job titles, and company information",
        },
      })

      if (scrapeResult.success) {
        if (scrapeResult.json) {
          // Use structured data if available
          const contacts = Array.isArray(scrapeResult.json) ? scrapeResult.json : [scrapeResult.json]

          for (const contact of contacts) {
            if (contact.name || contact.email) {
              leads.push({
                full_name: contact.name,
                email: contact.email,
                title: contact.title || contact.position,
                company: contact.company,
                source_url: url,
                source_content: JSON.stringify(contact),
                scraped_data: { extraction_method: "structured" },
                lead_score: calculateLeadScore(contact, campaign),
              })
            }
          }
        } else if (scrapeResult.markdown) {
          // Parse markdown for contact info
          const contacts = parseWebsiteContacts(scrapeResult.markdown)

          for (const contact of contacts) {
            leads.push({
              full_name: contact.name,
              email: contact.email,
              title: contact.title,
              company: contact.company,
              source_url: url,
              source_content: contact.context,
              scraped_data: { extraction_method: "markdown" },
              lead_score: calculateLeadScore(contact, campaign),
            })
          }
        }
      }
    } catch (error) {
      console.error(`Error scraping website ${url}:`, error)
    }
  }

  return leads
}

async function scrapeHackerNews(campaign: any, config: any) {
  const leads = []

  try {
    const scrapeResult = await firecrawl.scrapeUrl("https://news.ycombinator.com/", {
      formats: ["markdown"],
    })

    if (scrapeResult.success && scrapeResult.markdown) {
      const stories = parseHackerNewsStories(scrapeResult.markdown)

      for (const story of stories) {
        if (matchesKeywords(story.title, campaign.keywords)) {
          // Scrape individual story for comments
          const storyResult = await firecrawl.scrapeUrl(story.url, {
            formats: ["markdown"],
          })

          if (storyResult.success && storyResult.markdown) {
            const comments = parseHackerNewsComments(storyResult.markdown)

            for (const comment of comments) {
              if (comment.author && matchesKeywords(comment.content, campaign.keywords)) {
                leads.push({
                  full_name: comment.author,
                  source_url: story.url,
                  source_content: comment.content,
                  scraped_data: { story_title: story.title, comment_id: comment.id },
                  lead_score: calculateLeadScore(comment, campaign),
                })
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error scraping Hacker News:", error)
  }

  return leads
}

async function scrapeIndieHackers(campaign: any, config: any) {
  const leads = []

  try {
    const scrapeResult = await firecrawl.scrapeUrl("https://indiehackers.com/posts", {
      formats: ["markdown"],
    })

    if (scrapeResult.success && scrapeResult.markdown) {
      const posts = parseIndieHackersPosts(scrapeResult.markdown)

      for (const post of posts) {
        if (matchesKeywords(post.title + " " + post.content, campaign.keywords)) {
          leads.push({
            full_name: post.author,
            source_url: post.url,
            source_content: post.content,
            scraped_data: { post_title: post.title },
            lead_score: calculateLeadScore(post, campaign),
          })
        }
      }
    }
  } catch (error) {
    console.error("Error scraping IndieHackers:", error)
  }

  return leads
}

async function scrapeProductHunt(campaign: any, config: any) {
  const leads = []

  try {
    const scrapeResult = await firecrawl.scrapeUrl("https://producthunt.com/", {
      formats: ["markdown"],
    })

    if (scrapeResult.success && scrapeResult.markdown) {
      const products = parseProductHuntProducts(scrapeResult.markdown)

      for (const product of products) {
        if (matchesKeywords(product.description, campaign.keywords)) {
          leads.push({
            full_name: product.maker,
            company: product.name,
            source_url: product.url,
            source_content: product.description,
            scraped_data: { product_name: product.name, votes: product.votes },
            lead_score: calculateLeadScore(product, campaign),
          })
        }
      }
    }
  } catch (error) {
    console.error("Error scraping Product Hunt:", error)
  }

  return leads
}

async function scrapeTwitter(campaign: any, config: any) {
  const leads = []
  const searchTerms = config.search_terms || campaign.keywords || []

  for (const term of searchTerms) {
    try {
      const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(term)}&src=typed_query&f=live`

      const scrapeResult = await firecrawl.scrapeUrl(searchUrl, {
        formats: ["markdown"],
        actions: [
          { type: "wait", milliseconds: 3000 },
          { type: "scroll", direction: "down", amount: 3 },
          { type: "wait", milliseconds: 2000 },
        ],
      })

      if (scrapeResult.success && scrapeResult.markdown) {
        const tweets = parseTwitterTweets(scrapeResult.markdown)

        for (const tweet of tweets) {
          if (matchesKeywords(tweet.content, campaign.keywords)) {
            leads.push({
              full_name: tweet.author,
              twitter_handle: tweet.handle,
              source_url: tweet.url,
              source_content: tweet.content,
              scraped_data: { search_term: term, retweets: tweet.retweets, likes: tweet.likes },
              lead_score: calculateLeadScore(tweet, campaign),
            })
          }
        }
      }
    } catch (error) {
      console.error(`Error scraping Twitter for "${term}":`, error)
    }
  }

  return leads
}

async function scrapePlatform(platform: string, campaign: any, config: any) {
  switch (platform) {
    case "reddit":
      return scrapeReddit(campaign, config)
    case "linkedin":
      return scrapeLinkedIn(campaign, config)
    case "website":
      return scrapeWebsite(campaign, config)
    case "hackernews":
      return scrapeHackerNews(campaign, config)
    case "indiehackers":
      return scrapeIndieHackers(campaign, config)
    case "producthunt":
      return scrapeProductHunt(campaign, config)
    case "twitter":
      return scrapeTwitter(campaign, config)
    default:
      return []
  }
}

// Helper functions for parsing different platforms
function parseRedditPosts(markdown: string) {
  // Implementation to parse Reddit markdown into structured posts
  const posts = []
  // Add parsing logic here
  return posts
}

function parseLinkedInProfiles(markdown: string) {
  // Implementation to parse LinkedIn search results
  const profiles = []
  // Add parsing logic here
  return profiles
}

function parseWebsiteContacts(markdown: string) {
  // Implementation to extract contact information from website markdown
  const contacts = []
  // Add parsing logic here
  return contacts
}

function parseHackerNewsStories(markdown: string) {
  // Implementation to parse HN stories
  const stories = []
  // Add parsing logic here
  return stories
}

function parseHackerNewsComments(markdown: string) {
  // Implementation to parse HN comments
  const comments = []
  // Add parsing logic here
  return comments
}

function parseIndieHackersPosts(markdown: string) {
  // Implementation to parse IH posts
  const posts = []
  // Add parsing logic here
  return posts
}

function parseProductHuntProducts(markdown: string) {
  // Implementation to parse PH products
  const products = []
  // Add parsing logic here
  return products
}

function parseTwitterTweets(markdown: string) {
  // Implementation to parse Twitter tweets
  const tweets = []
  // Add parsing logic here
  return tweets
}

function matchesKeywords(content: string, keywords: string[] = []) {
  if (!keywords || keywords.length === 0) return true

  const lowerContent = content.toLowerCase()
  return keywords.some((keyword) => lowerContent.includes(keyword.toLowerCase()))
}

function calculateLeadScore(data: any, campaign: any) {
  let score = 0.5 // Base score

  // Add scoring logic based on campaign.lead_scoring_rules
  if (data.email) score += 0.2
  if (data.linkedin_url) score += 0.1
  if (data.company) score += 0.1
  if (data.title) score += 0.1

  return Math.min(score, 1.0)
}
