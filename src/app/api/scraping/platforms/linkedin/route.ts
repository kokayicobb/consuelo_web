// src/app/api/scraping/platforms/linkedin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import FirecrawlApp from '@mendable/firecrawl-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY!
});

interface LinkedInScrapingConfig {
  company_urls?: string[];
  search_keywords?: string[];
  target_titles?: string[];
  target_industries?: string[];
  max_results?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, config }: { jobId: string; config: LinkedInScrapingConfig } = body;

    if (!jobId || !config) {
      return NextResponse.json(
        { error: 'Job ID and configuration required' },
        { status: 400 }
      );
    }

    // Update job status
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', jobId);

    const allLeads: any[] = [];
    const errors: string[] = [];

    // Process company pages
    if (config.company_urls && config.company_urls.length > 0) {
      for (const companyUrl of config.company_urls) {
        try {
          // Scrape company page
          const companyResult = await firecrawl.scrapeUrl(companyUrl, {
            formats: ['markdown'],
            onlyMainContent: true
          });

          if (!companyResult.success) {
            throw new Error(`Failed to scrape company: ${companyUrl}`);
          }

          // Extract company information and key people
          const extractUrl = companyUrl;
          const extractPrompt = `Extract company information and key employees/executives.
            Focus on:
            - Company name, industry, size, and description
            - Recent company updates, news, or announcements
            - Key employees with their names, titles, and any visible contact information
            - Any mentioned growth, funding, or expansion that indicates buying potential`;
          
          const extractSchema = z.object({
            company: z.object({
              name: z.string(),
              industry: z.string(),
              size: z.string(),
              description: z.string(),
              website: z.string(),
              recent_updates: z.array(z.string())
            }),
            employees: z.array(z.object({
              full_name: z.string(),
              title: z.string(),
              department: z.string(),
              profile_url: z.string(),
              about: z.string()
            }))
          });

          // Extract structured data
          const extractionResult = await firecrawl.scrapeUrl(extractUrl, {
            formats: ['extract'],
            extract: {
              prompt: extractPrompt,
              schema: extractSchema
            }
          });

          if (extractionResult.success && extractionResult.extract) {
            const { company, employees } = extractionResult.extract;

            // Create leads from employees
            if (employees && employees.length > 0) {
              const companyLeads = employees
                .filter((emp: any) => {
                  // Filter by target titles if specified
                  if (config.target_titles && config.target_titles.length > 0) {
                    return config.target_titles.some(title => 
                      emp.title?.toLowerCase().includes(title.toLowerCase())
                    );
                  }
                  return true;
                })
                .map((emp: any) => ({
                  platform: 'linkedin',
                  full_name: emp.full_name,
                  first_name: emp.full_name?.split(' ')[0],
                  last_name: emp.full_name?.split(' ').slice(1).join(' '),
                  title: emp.title,
                  company: company?.name,
                  company_size: company?.size,
                  industry: company?.industry,
                  linkedin_url: emp.profile_url,
                  source_url: companyUrl,
                  source_content: emp.about,
                  scraped_data: {
                    company_info: company,
                    department: emp.department,
                    recent_company_updates: company?.recent_updates
                  },
                  lead_score: calculateLinkedInLeadScore(emp, company),
                  status: 'new'
                }));

              allLeads.push(...companyLeads);
            }
          }
        } catch (error) {
          console.error(`Error scraping LinkedIn company ${companyUrl}:`, error);
          errors.push(`Failed to scrape ${companyUrl}: ${error.message}`);
        }
      }
    }

    // Process LinkedIn search if keywords provided
    if (config.search_keywords && config.search_keywords.length > 0) {
      for (const keyword of config.search_keywords) {
        try {
          // Note: Direct LinkedIn search scraping is challenging due to authentication
          // In production, you might want to use LinkedIn Sales Navigator API or other methods
          const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keyword)}`;
          
          const searchResult = await firecrawl.scrapeUrl(searchUrl, {
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 2000 // Wait for dynamic content
          });

          if (searchResult.success) {
            // Extract search results using the same approach
            const extractPrompt = `Extract LinkedIn profiles from search results.
              For each profile, extract:
              - Full name
              - Current title and company
              - Location
              - Profile URL
              - Any visible contact information or about text`;
            
            const extractSchema = z.object({
  profiles: z.array(z.object({
    full_name: z.string(),
    title: z.string(),
    company: z.string(),
    location: z.string(),
    profile_url: z.string(),
    about: z.string()
  }))
});

            const extractionResult = await firecrawl.scrapeUrl(searchUrl, {
              formats: ['extract'],
              extract: {
                prompt: extractPrompt,
                schema: extractSchema
              }
            });

            if (extractionResult.success && extractionResult.extract?.profiles) {
              const searchLeads = extractionResult.extract.profiles.map((profile: any) => ({
                platform: 'linkedin',
                full_name: profile.full_name,
                first_name: profile.full_name?.split(' ')[0],
                last_name: profile.full_name?.split(' ').slice(1).join(' '),
                title: profile.title,
                company: profile.company,
                location: profile.location,
                linkedin_url: profile.profile_url,
                source_url: searchUrl,
                scraped_data: {
                  search_keyword: keyword,
                  about: profile.about
                },
                lead_score: 0.6, // Default score for search results
                status: 'new'
              }));

              allLeads.push(...searchLeads);
            }
          }
        } catch (error) {
          console.error(`Error searching LinkedIn for "${keyword}":`, error);
          errors.push(`Failed to search for "${keyword}": ${error.message}`);
        }
      }
    }

    // Get job details to find campaign
    const { data: job } = await supabase
      .from('scraping_jobs')
      .select('campaign_id')
      .eq('id', jobId)
      .single();

    if (job && allLeads.length > 0) {
      // Remove duplicates based on LinkedIn URL
      const uniqueLeads = allLeads.reduce((acc, lead) => {
        const key = lead.linkedin_url || `${lead.full_name}-${lead.company}`;
        if (!acc.has(key)) {
          acc.set(key, lead);
        }
        return acc;
      }, new Map()).values();

      // Insert leads into database
      const { error: insertError } = await supabase
        .from('scraped_leads')
        .insert(
          Array.from(uniqueLeads).map((lead: Record<string, any>) => ({
            ...lead,
            campaign_id: job.campaign_id,
            job_id: jobId
          }))
        );

      if (insertError) {
        console.error('Error inserting leads:', insertError);
      }
    }

    // Update job with results
    await supabase
      .from('scraping_jobs')
      .update({
        status: errors.length > 0 && allLeads.length === 0 ? 'failed' : 'completed',
        completed_at: new Date().toISOString(),
        stats: {
          leads_found: allLeads.length,
          pages_scraped: (config.company_urls?.length || 0) + (config.search_keywords?.length || 0),
          errors: errors.length
        },
        error_message: errors.length > 0 ? errors.join('; ') : null
      })
      .eq('id', jobId);

    return NextResponse.json({
      success: true,
      leads_found: allLeads.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('LinkedIn scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape LinkedIn', details: error.message },
      { status: 500 }
    );
  }
}

function calculateLinkedInLeadScore(employee: any, company: any): number {
  let score = 0.6; // Base score for LinkedIn

  // Title seniority
  const seniorTitles = ['ceo', 'cto', 'cfo', 'vp', 'vice president', 'director', 'head of', 'founder'];
  if (employee.title && seniorTitles.some(title => employee.title.toLowerCase().includes(title))) {
    score += 0.2;
  }

  // Company signals
  if (company?.recent_updates && company.recent_updates.length > 0) {
    score += 0.1; // Active company
  }

  // Has department info
  if (employee.department) {
    score += 0.05;
  }

  // Has about/bio
  if (employee.about && employee.about.length > 50) {
    score += 0.05;
  }

  return Math.min(score, 1.0);
}