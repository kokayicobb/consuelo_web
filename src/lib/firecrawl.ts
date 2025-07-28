import FirecrawlApp from "@mendable/firecrawl-js"

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })

// Rate limiter
export class RateLimiter {
  private tokens: number
  private lastRefill: number
  private readonly maxTokens: number
  private readonly refillRate: number

  constructor(maxTokens = 5, refillRate = 1000) {
    this.maxTokens = maxTokens
    this.tokens = maxTokens
    this.refillRate = refillRate
    this.lastRefill = Date.now()
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    const timePassed = now - this.lastRefill
    const tokensToAdd = Math.floor(timePassed / this.refillRate)

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
    this.lastRefill = now

    if (this.tokens < 1) {
      const waitTime = this.refillRate - (timePassed % this.refillRate)
      console.log(`⏳ Rate limit reached, waiting ${waitTime}ms`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      this.tokens = 1
    }

    this.tokens--
  }
}

export const defaultRateLimiter = new RateLimiter(2, 1000) // 2 requests per second

export async function searchReddit(
  subreddit: string,
  keywords: string[],
  limit = 10,
): Promise<{ success: boolean; postUrls?: string[]; error?: any }> {
  try {
    console.log(`🔍 Searching Reddit r/${subreddit} for keywords: ${keywords.join(", ")}`)

    // Use Firecrawl to search Reddit
    const searchUrl = `https://www.reddit.com/r/${subreddit}/search/?q=${keywords.join(" OR ")}&restrict_sr=1&sort=new&limit=${limit}`

    const scrapeResult = await app.scrapeUrl(searchUrl, {
      formats: ["markdown"],
      onlyMainContent: true,
    })

    if (!scrapeResult.success) {
      console.error("❌ Reddit search failed:", scrapeResult)
      throw new Error("Failed to crawl Reddit search")
    }

    // Extract post URLs from the search results
    const markdown = scrapeResult.markdown || ""
    const postUrls = extractRedditPostUrls(markdown)

    console.log(`✅ Found ${postUrls.length} Reddit posts`)
    return { success: true, postUrls }
  } catch (error) {
    console.error("❌ Error searching Reddit:", error)
    return { success: false, error }
  }
}

export async function scrapeRedditPost(postUrl: string): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    console.log(`📄 Scraping Reddit post: ${postUrl}`)

    const scrapeResult = await app.scrapeUrl(postUrl, {
      formats: ["markdown"],
      onlyMainContent: true,
    })

    if (!scrapeResult.success) {
      console.error("❌ Reddit post scrape failed:", scrapeResult)
      throw new Error("Failed to scrape Reddit post")
    }

    const data = parseRedditPost(scrapeResult, postUrl)
    return { success: true, data }
  } catch (error) {
    console.error("❌ Error scraping Reddit post:", error)
    return { success: false, error }
  }
}

export async function crawlWebsite(
  websiteUrl: string,
  options: { limit?: number; includes?: string[]; excludes?: string[] } = {},
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    console.log(`🌐 Crawling website: ${websiteUrl}`)

    const crawlResult = await app.crawlUrl(websiteUrl, {
      limit: options.limit || 10,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      },
    })

    if (!crawlResult.success) {
      console.error("❌ Website crawl failed:", crawlResult)
      throw new Error("Failed to crawl website")
    }

    console.log(`✅ Crawled ${crawlResult.data?.length || 0} pages`)
    return { success: true, data: crawlResult }
  } catch (error) {
    console.error("❌ Error crawling website:", error)
    return { success: false, error }
  }
}

export async function scrapeContactPage(pageUrl: string): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    console.log(`📞 Scraping contact page: ${pageUrl}`)

    const scrapeResult = await app.scrapeUrl(pageUrl, {
      formats: ["markdown"],
      onlyMainContent: true,
    })

    if (!scrapeResult.success) {
      console.error("❌ Contact page scrape failed:", scrapeResult)
      throw new Error("Failed to scrape contact page")
    }

    const contacts = parseContactInfo(scrapeResult)
    return { success: true, data: contacts }
  } catch (error) {
    console.error("❌ Error scraping contact page:", error)
    return { success: false, error }
  }
}

export async function scrapeCompanyInfo(websiteUrl: string): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    console.log(`🏢 Scraping company info from: ${websiteUrl}`)

    const scrapeResult = await app.scrapeUrl(websiteUrl, {
      formats: ["markdown"],
      onlyMainContent: true,
    })

    if (!scrapeResult.success) {
      console.error("❌ Company info scrape failed:", scrapeResult)
      throw new Error("Failed to scrape company info")
    }

    const companyData = parseCompanyInfo(scrapeResult, websiteUrl)
    return { success: true, data: companyData }
  } catch (error) {
    console.error("❌ Error scraping company info:", error)
    return { success: false, error }
  }
}

// Helper functions
function extractRedditPostUrls(markdown: string): string[] {
  const urlRegex = /https:\/\/www\.reddit\.com\/r\/\w+\/comments\/\w+\/[^\s)]+/g
  const matches = markdown.match(urlRegex) || []
  return [...new Set(matches)] // Remove duplicates
}

function parseRedditPost(scrapeResult: any, postUrl: string): any {
  const markdown = scrapeResult.markdown || ""
  const metadata = scrapeResult.metadata || {}

  // Extract basic info from markdown
  const titleMatch = markdown.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : metadata.title || ""

  const authorMatch = markdown.match(/u\/(\w+)/)
  const author = authorMatch ? authorMatch[1] : ""

  // Simple business need detection
  const businessKeywords = [
    "looking for",
    "need help",
    "recommendation",
    "service",
    "hire",
    "budget",
    "quote",
    "freelancer",
    "contractor",
  ]
  const urgencyKeywords = ["urgent", "asap", "immediately", "quickly", "soon"]
  const budgetKeywords = ["budget", "$", "cost", "price", "pay", "payment"]

  const lowerMarkdown = markdown.toLowerCase()
  const hasBusinessNeed = businessKeywords.some((keyword) => lowerMarkdown.includes(keyword))
  const hasUrgency = urgencyKeywords.some((keyword) => lowerMarkdown.includes(keyword))
  const hasBudget = budgetKeywords.some((keyword) => lowerMarkdown.includes(keyword))

  return {
    url: postUrl,
    title,
    content: markdown,
    author,
    upvotes: Math.floor(Math.random() * 50), // Mock data - would need Reddit API for real data
    comments_count: Math.floor(Math.random() * 20),
    needs_analysis: {
      is_business_need: hasBusinessNeed,
      urgency_level: hasUrgency ? "high" : hasBusinessNeed ? "medium" : "low",
      budget_mentioned: hasBudget,
      contact_info_available: markdown.includes("@") || markdown.includes("contact") || markdown.includes("dm"),
    },
  }
}

function parseContactInfo(scrapeResult: any): any[] {
  const markdown = scrapeResult.markdown || ""
  const metadata = scrapeResult.metadata || {}

  // Extract emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const emails = markdown.match(emailRegex) || []

  // Extract names (basic pattern matching)
  const nameRegex =
    /(?:CEO|CTO|CFO|President|Director|Manager|VP|Vice President|Founder|Co-Founder|Head of|Lead)\s*:?\s*([A-Z][a-z]+ [A-Z][a-z]+)/gi
  const titleNameMatches = [...markdown.matchAll(nameRegex)]

  // Extract phone numbers
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g
  const phones = markdown.match(phoneRegex) || []

  // Extract LinkedIn URLs
  const linkedinRegex = /https?:\/\/(?:www\.)?linkedin\.com\/in\/[\w-]+/g
  const linkedinUrls = markdown.match(linkedinRegex) || []

  const contacts = []

  // Process title-name matches
  titleNameMatches.forEach((match, index) => {
    const fullMatch = match[0]
    const name = match[1]
    const titleMatch = fullMatch.split(":")[0] || fullMatch.split(name)[0]
    const title = titleMatch.replace(/[^\w\s]/g, "").trim()

    contacts.push({
      name: name,
      email: emails[index] || null,
      title: title || null,
      company: metadata.title || extractCompanyFromUrl(scrapeResult.sourceURL || ""),
      linkedin_url: linkedinUrls[index] || null,
      phone: phones[index] || null,
      location: null, // Would need more sophisticated extraction
    })
  })

  // If no title-name matches, create contacts from emails
  if (contacts.length === 0 && emails.length > 0) {
    emails.forEach((email, index) => {
      contacts.push({
        name: null,
        email: email,
        title: null,
        company: metadata.title || extractCompanyFromUrl(scrapeResult.sourceURL || ""),
        linkedin_url: linkedinUrls[index] || null,
        phone: phones[index] || null,
        location: null,
      })
    })
  }

  return contacts.filter((contact) => contact.email || contact.name) // Only return contacts with at least email or name
}

function parseCompanyInfo(scrapeResult: any, websiteUrl: string): any {
  const markdown = scrapeResult.markdown || ""
  const metadata = scrapeResult.metadata || {}

  // Extract company name from title or URL
  const companyName = metadata.title || extractCompanyFromUrl(websiteUrl)

  // Simple industry detection
  const industryKeywords = {
    Technology: ["software", "tech", "app", "platform", "saas", "ai", "machine learning"],
    Healthcare: ["health", "medical", "hospital", "clinic", "pharma"],
    Finance: ["bank", "financial", "investment", "insurance", "fintech"],
    Retail: ["retail", "ecommerce", "shop", "store", "marketplace"],
    Manufacturing: ["manufacturing", "factory", "production", "industrial"],
    Consulting: ["consulting", "advisory", "services", "strategy"],
  }

  let detectedIndustry = "Other"
  const lowerMarkdown = markdown.toLowerCase()

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some((keyword) => lowerMarkdown.includes(keyword))) {
      detectedIndustry = industry
      break
    }
  }

  return {
    name: companyName,
    description: metadata.description || markdown.substring(0, 200) + "...",
    industry: detectedIndustry,
    website: websiteUrl,
    location: null, // Would need more sophisticated extraction
  }
}

function extractCompanyFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    const parts = domain.split(".")
    const mainPart = parts.length > 2 ? parts[parts.length - 2] : parts[0]
    return mainPart.charAt(0).toUpperCase() + mainPart.slice(1)
  } catch {
    return "Unknown Company"
  }
}
