import { createClient } from "@supabase/supabase-js"
import { searchReddit, scrapeRedditPost, crawlWebsite, scrapeContactPage, defaultRateLimiter } from "@/lib/firecrawl"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function processJob(jobId: string) {
  try {
    console.log("🔄 Processing job directly:", jobId)

    // Get job details
    const { data: job, error } = await supabase
      .from("scraping_jobs")
      .select(`
        *,
        scraping_campaigns (
          *,
          platform_configurations (*)
        )
      `)
      .eq("id", jobId)
      .single()

    if (error || !job) {
      console.error("❌ Job not found:", error)
      throw new Error("Job not found")
    }

    console.log("✅ Job found:", job.id)
    console.log("📋 Campaign:", job.scraping_campaigns?.name)
    console.log("📋 Platforms:", job.platforms_to_scrape)

    // Update job status to running
    await supabase
      .from("scraping_jobs")
      .update({
        status: "running",
        started_at: new Date().toISOString(),
      })
      .eq("id", jobId)

    console.log("🚀 Job marked as running")

    let totalLeadsFound = 0
    let totalPagesScraped = 0
    let totalErrors = 0

    try {
      // Process each platform
      for (const platform of job.platforms_to_scrape) {
        console.log(`🎯 Processing platform: ${platform}`)

        // Get platform configuration
        const platformConfig = job.scraping_campaigns.platform_configurations.find(
          (config: any) => config.platform === platform,
        )

        if (!platformConfig) {
          console.log(`⚠️ No configuration found for platform: ${platform}`)
          continue
        }

        if (platform === "reddit") {
          const redditResults = await processRedditScraping(job.scraping_campaigns, platformConfig, job.id)
          totalLeadsFound += redditResults.leadsFound
          totalPagesScraped += redditResults.pagesScraped
          totalErrors += redditResults.errors
        } else if (platform === "website") {
          const websiteResults = await processWebsiteScraping(job.scraping_campaigns, platformConfig, job.id)
          totalLeadsFound += websiteResults.leadsFound
          totalPagesScraped += websiteResults.pagesScraped
          totalErrors += websiteResults.errors
        }
      }

      // Update job as completed
      await supabase
        .from("scraping_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          stats: {
            leads_found: totalLeadsFound,
            pages_scraped: totalPagesScraped,
            errors: totalErrors,
          },
        })
        .eq("id", jobId)

      console.log(`✅ Job completed successfully with ${totalLeadsFound} leads found`)

      return {
        success: true,
        message: "Job processed successfully",
        leads_found: totalLeadsFound,
        pages_scraped: totalPagesScraped,
        errors: totalErrors,
      }
    } catch (processingError) {
      console.error("💥 Error during scraping:", processingError)

      // Update job as failed
      await supabase
        .from("scraping_jobs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: processingError instanceof Error ? processingError.message : "Unknown error",
          stats: {
            leads_found: totalLeadsFound,
            pages_scraped: totalPagesScraped,
            errors: totalErrors + 1,
          },
        })
        .eq("id", jobId)

      throw processingError
    }
  } catch (error) {
    console.error("💥 Job processing error:", error)
    throw error
  }
}

async function processRedditScraping(campaign: any, platformConfig: any, jobId: string) {
  let leadsFound = 0
  let pagesScraped = 0
  let errors = 0

  try {
    const { config } = platformConfig
    const subreddits = config.subreddits || []
    const keywords = campaign.keywords || []

    console.log(`🔍 Reddit scraping: ${subreddits.length} subreddits, ${keywords.length} keywords`)

    for (const subreddit of subreddits) {
      try {
        await defaultRateLimiter.waitIfNeeded()
        console.log(`🎯 Searching subreddit: r/${subreddit}`)

        // Search Reddit for posts
        const searchResult = await searchReddit(subreddit, keywords, 10)

        if (!searchResult.success) {
          console.error(`❌ Reddit search failed for r/${subreddit}:`, searchResult.error)
          errors++
          continue
        }

        pagesScraped++

        // Process each post URL found
        for (const postUrl of searchResult.postUrls.slice(0, 5)) {
          try {
            await defaultRateLimiter.waitIfNeeded()
            console.log(`📄 Scraping Reddit post: ${postUrl}`)

            const postResult = await scrapeRedditPost(postUrl)

            if (!postResult.success || !postResult.data) {
              console.error(`❌ Failed to scrape post: ${postUrl}`)
              errors++
              continue
            }

            pagesScraped++

            // Check if this represents a business need
            if (postResult.data.needs_analysis?.is_business_need) {
              // Create lead record
              const lead = {
                source_url: postUrl,
                reddit_username: postResult.data.author,
                full_name: postResult.data.author,
                source_content: postResult.data.content,
                scraped_data: postResult.data,
                lead_score: calculateRedditLeadScore(postResult.data),
                platform: "reddit",
              }

              // Insert lead
              const { error: insertError } = await supabase.from("scraped_leads").insert({
                campaign_id: campaign.id,
                job_id: jobId,
                ...lead,
                status: "new",
                is_duplicate: false,
                enrichment_status: "pending",
              })

              if (insertError) {
                console.error("❌ Error inserting Reddit lead:", insertError)
                errors++
              } else {
                leadsFound++
                console.log(`✅ Reddit lead created from r/${subreddit}`)
              }
            }
          } catch (postError) {
            console.error(`❌ Error processing post ${postUrl}:`, postError)
            errors++
          }
        }
      } catch (subredditError) {
        console.error(`❌ Error processing subreddit r/${subreddit}:`, subredditError)
        errors++
      }
    }
  } catch (error) {
    console.error("❌ Reddit scraping error:", error)
    errors++
  }

  return { leadsFound, pagesScraped, errors }
}

async function processWebsiteScraping(campaign: any, platformConfig: any, jobId: string) {
  let leadsFound = 0
  let pagesScraped = 0
  let errors = 0

  try {
    const { config } = platformConfig
    const websites = config.website_urls || []

    console.log(`🌐 Website scraping: ${websites.length} websites`)

    for (const websiteUrl of websites) {
      try {
        await defaultRateLimiter.waitIfNeeded()
        console.log(`🎯 Crawling website: ${websiteUrl}`)

        // Crawl website
        const crawlResult = await crawlWebsite(websiteUrl, {
          limit: 10,
          includes: ["**/team*", "**/about*", "**/contact*", "**/people*"],
          excludes: ["**/blog*", "**/news*", "**/career*"],
        })

        if (!crawlResult.success || !crawlResult.data) {
          console.error(`❌ Website crawl failed for ${websiteUrl}:`, crawlResult.error)
          errors++
          continue
        }

        pagesScraped += crawlResult.data.data?.length || 0

        // Process each crawled page
        for (const page of crawlResult.data.data || []) {
          try {
            await defaultRateLimiter.waitIfNeeded()

            // Try to extract contact information
            const contactResult = await scrapeContactPage(page.url)

            if (contactResult.success && contactResult.data && Array.isArray(contactResult.data)) {
              for (const contact of contactResult.data) {
                if (contact.email || contact.name) {
                  // Create lead record
                  const lead = {
                    source_url: page.url,
                    email: contact.email,
                    full_name: contact.name,
                    title: contact.title,
                    company: contact.company,
                    linkedin_url: contact.linkedin_url,
                    location: contact.location,
                    source_content: page.markdown?.substring(0, 1000),
                    scraped_data: contact,
                    lead_score: calculateWebsiteLeadScore(contact),
                    platform: "website",
                  }

                  // Insert lead
                  const { error: insertError } = await supabase.from("scraped_leads").insert({
                    campaign_id: campaign.id,
                    job_id: jobId,
                    ...lead,
                    status: "new",
                    is_duplicate: false,
                    enrichment_status: "pending",
                  })

                  if (insertError) {
                    console.error("❌ Error inserting website lead:", insertError)
                    errors++
                  } else {
                    leadsFound++
                    console.log(`✅ Website lead created from ${websiteUrl}`)
                  }
                }
              }
            }
          } catch (pageError) {
            console.error(`❌ Error processing page ${page.url}:`, pageError)
            errors++
          }
        }
      } catch (websiteError) {
        console.error(`❌ Error processing website ${websiteUrl}:`, websiteError)
        errors++
      }
    }
  } catch (error) {
    console.error("❌ Website scraping error:", error)
    errors++
  }

  return { leadsFound, pagesScraped, errors }
}

function calculateRedditLeadScore(data: any): number {
  let score = 0.3 // Base score

  if (data.needs_analysis?.urgency_level === "high") score += 0.3
  else if (data.needs_analysis?.urgency_level === "medium") score += 0.2

  if (data.needs_analysis?.budget_mentioned) score += 0.2
  if (data.needs_analysis?.contact_info_available) score += 0.2
  if (data.upvotes && data.upvotes > 10) score += 0.1
  if (data.comments_count && data.comments_count > 5) score += 0.1

  return Math.min(score, 1.0)
}

function calculateWebsiteLeadScore(contact: any): number {
  let score = 0.4 // Base score for website contacts

  if (contact.email) score += 0.3
  if (contact.title) score += 0.1
  if (contact.linkedin_url) score += 0.1
  if (contact.company) score += 0.1

  return Math.min(score, 1.0)
}
