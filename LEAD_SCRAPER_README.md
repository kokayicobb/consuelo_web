# Lead Scraper System - Setup & Usage Guide

## Overview

A production-ready lead generation platform that uses Firecrawl to scrape websites and Reddit for potential business leads. Built with Next.js 14, TypeScript, Supabase, and Clerk authentication.

## Features

- **Multi-Platform Scraping**: Reddit and website scraping with Firecrawl integration
- **Automated Campaigns**: Schedule recurring scraping jobs
- **Lead Scoring**: AI-powered lead qualification
- **Contact Enrichment**: Apollo integration for contact data enhancement
- **Real-time Dashboard**: Track jobs, leads, and analytics
- **Export Capabilities**: CSV/JSON export of leads
- **Enterprise Security**: Row-level security with Clerk authentication

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Scraping**: Firecrawl API
- **UI Components**: shadcn/ui (already configured)

## Prerequisites

1. **Node.js 18+** and npm/yarn
2. **Supabase account** and project
3. **Clerk account** and application
4. **Firecrawl API key** from [firecrawl.dev](https://firecrawl.dev)
5. **Apollo API key** (optional, for lead enrichment)

## Installation & Setup

### 1. Environment Variables

Create/update your `.env.local` file with the following variables:

```bash
# Existing variables (don't modify if already working)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# New variables for lead scraper
FIRECRAWL_API_KEY=your_firecrawl_api_key
DATABASE_URL=your_neon_or_supabase_connection_string

# Optional for enrichment
APOLLO_API_KEY=your_apollo_api_key

# For internal API calls
INTERNAL_API_KEY=your_internal_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup

Run the SQL schema in your Supabase SQL editor:

```sql
-- Copy and paste the entire contents of:
-- src/lib/supabase/lead-scraper-schema.sql
```

This creates:
- `users` table (may already exist)
- `scraping_campaigns` table
- `platform_configurations` table  
- `scraping_jobs` table
- `scraped_leads` table
- `enrichment_data` table
- Proper indexes and RLS policies

### 3. Install Dependencies

The required dependencies are already installed:
- `@mendable/firecrawl-js` - Firecrawl integration
- `@supabase/supabase-js` - Supabase client
- `@clerk/nextjs` - Authentication
- `zod` - Schema validation

### 4. API Keys Setup

#### Firecrawl API Key
1. Sign up at [firecrawl.dev](https://firecrawl.dev)
2. Get your API key from the dashboard
3. Add to `FIRECRAWL_API_KEY` in `.env.local`

#### Apollo API Key (Optional)
1. Sign up at [apolloio.com](https://apolloio.com)
2. Get API access and key
3. Add to `APOLLO_API_KEY` in `.env.local`

## Usage

### Accessing the Lead Scraper

The lead scraper is integrated into the existing unified commerce dashboard:

1. Navigate to the **Apps** tab in your dashboard
2. Look for the **Scraper** section
3. Click on **Lead Generation Platform**

### Creating a Campaign

1. Click **"New Campaign"** in the lead scraper dashboard
2. **Step 1: Basic Info**
   - Enter campaign name and description
   - Select platforms (Reddit, Website, LinkedIn)
3. **Step 2: Platform Configuration**
   - **Reddit**: Enter subreddit names (e.g., "startups, entrepreneur, smallbusiness")
   - **Website**: Enter company website URLs (one per line)
   - **Keywords**: Enter relevant keywords for searching
4. **Step 3: Schedule**
   - Choose frequency (One-time, Daily, Weekly, Monthly)
   - Set run time for recurring campaigns

### Platform-Specific Setup

#### Reddit Scraping
- **Subreddits**: Enter names without "r/" (e.g., "startups")
- **Keywords**: Business-related terms (e.g., "looking for", "need help", "recommendation")
- **Output**: Extracts posts where people are seeking business services

#### Website Scraping  
- **URLs**: Full website URLs (e.g., "https://company.com")
- **Target Pages**: Automatically crawls team, about, contact pages
- **Output**: Extracts contact information, names, titles, emails

### Lead Management

#### Lead Scoring
- **Reddit Leads**: Scored based on urgency, budget mentions, engagement
- **Website Leads**: Scored based on contact completeness and role seniority
- **Range**: 0.0 to 1.0 (higher is better)

#### Lead Statuses
- **New**: Recently scraped, unreviewed
- **Qualified**: Meets your criteria
- **Contacted**: Outreach initiated
- **Nurturing**: In sales process
- **Converted**: Became customer
- **Disqualified**: Not a good fit

#### Enrichment
1. Select leads in the leads table
2. Click **"Enrich"** button
3. Apollo API will add:
   - Work email addresses
   - Phone numbers
   - Company details
   - Social profiles

### Analytics & Reporting

#### Overview Dashboard
- Total leads generated
- Qualified leads count
- Enrichment completion rate
- Active campaigns

#### Analytics Tab
- Leads over time (line chart)
- Platform performance (bar chart)
- Conversion metrics
- Campaign effectiveness

#### Export Options
- **CSV**: Spreadsheet format for sales teams
- **JSON**: API integration format
- **Filters**: Export specific segments

## API Endpoints

### Campaigns
```
GET    /api/scraping/campaigns           # List user's campaigns
POST   /api/scraping/campaigns           # Create new campaign
POST   /api/scraping/campaigns/{id}/run  # Run campaign manually
PATCH  /api/scraping/campaigns/{id}      # Update campaign
DELETE /api/scraping/campaigns/{id}      # Delete campaign
```

### Jobs
```
GET    /api/scraping/jobs                # List scraping jobs
POST   /api/scraping/jobs                # Create manual job
POST   /api/scraping/process-job         # Process job (internal)
```

### Leads
```
GET    /api/scraping/leads               # List leads with filters
POST   /api/scraping/leads               # Add leads (internal)
PATCH  /api/scraping/leads               # Update lead status
GET    /api/scraping/leads/export        # Export leads
POST   /api/scraping/leads/enrich        # Enrich leads with Apollo
```

### Analytics
```
GET    /api/scraping/analytics           # Get dashboard analytics
```

## File Structure

```
src/
├── app/api/scraping/                   # API routes
│   ├── campaigns/                      # Campaign management
│   ├── jobs/                          # Job management  
│   ├── leads/                         # Lead management
│   ├── analytics/                     # Dashboard analytics
│   └── process-job/                   # Background job processing
├── lib/
│   ├── firecrawl.ts                   # Firecrawl client & utilities
│   └── supabase/
│       └── lead-scraper-schema.sql    # Database schema
├── types/
│   └── lead-scraper.ts                # TypeScript definitions
└── components/
    └── Unified Commerce Dashboard/
        └── tabs/apps/app-views/scraper/
            └── lead-scraper-dashboard.tsx  # Main UI component
```

## Rate Limiting & Best Practices

### Firecrawl Limits
- **Default**: 2 requests per second
- **Timeout**: 30 seconds per request
- **Retry Logic**: Built-in with exponential backoff

### Reddit Scraping
- **Posts per subreddit**: Limited to 5 to avoid rate limits
- **Subreddits per campaign**: Recommend 3-5 maximum
- **Keywords**: Use 3-5 relevant business terms

### Website Scraping
- **Pages per website**: Limited to 10 pages
- **Target pages**: Focuses on team/about/contact pages
- **Excludes**: Blog, news, career pages (to reduce noise)

## Troubleshooting

### Common Issues

#### 1. "API endpoint not found" Error
```bash
# Check if the route files exist:
ls src/app/api/scraping/
```

#### 2. Database Connection Issues
```bash
# Verify environment variables:
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

#### 3. Firecrawl API Errors
```bash
# Test your API key:
curl -X GET "https://api.firecrawl.dev/v0/scrape" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

#### 4. No Leads Found
- Check if keywords are too specific
- Verify subreddit names are correct
- Ensure website URLs are accessible
- Check Firecrawl API quota/limits

### Debug Mode

Enable detailed logging:
```bash
# Add to .env.local
NODE_ENV=development
DEBUG=true
```

### Database Queries

Check data directly in Supabase:
```sql
-- Check campaigns
SELECT * FROM scraping_campaigns ORDER BY created_at DESC;

-- Check recent jobs
SELECT * FROM scraping_jobs ORDER BY created_at DESC LIMIT 10;

-- Check leads
SELECT * FROM scraped_leads ORDER BY created_at DESC LIMIT 10;
```

## Security Considerations

### Row Level Security
- All tables have RLS enabled
- Users can only access their own data
- Service role bypasses RLS for internal operations

### API Security
- All routes require Clerk authentication
- Internal API calls use secret key validation
- Rate limiting prevents abuse

### Data Privacy
- No sensitive data logged in production
- PII is encrypted at rest in Supabase
- GDPR compliant data handling

## Performance Optimization

### Firecrawl Usage
- Use structured extraction with Zod schemas
- Implement proper rate limiting
- Cache results when possible
- Monitor API usage/costs

### Database Optimization
- Indexes on frequently queried columns
- Pagination for large result sets
- Background job processing
- Regular cleanup of old data

## Support & Maintenance

### Monitoring
- Check Supabase logs for errors
- Monitor Firecrawl API usage
- Track lead quality metrics
- Set up alerts for failed jobs

### Scaling
- Consider upgrading Firecrawl plan for higher limits
- Implement job queuing for large campaigns
- Add database read replicas for analytics
- Consider caching layer for dashboard

## License

This lead scraper system is part of the Consuelo platform. See main project license for details.