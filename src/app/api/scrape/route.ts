import { NextRequest, NextResponse } from 'next/server';
import { Stagehand } from "@browserbasehq/stagehand";
import { Browserbase } from '@browserbasehq/sdk';
import { z } from "zod";
import FirecrawlApp from '@mendable/firecrawl-js';

export async function GET() {
  return NextResponse.json({
    message: 'Lead Scraping API is working',
    hasApiKey: !!process.env.BROWSERBASE_API_KEY,
    hasProjectId: !!process.env.BROWSERBASE_PROJECT_ID,
    supportedIndustries: ['ecommerce', 'gyms', 'loans', 'general']
  });
}

// Even simpler schema for better reliability
const SimpleLeadSchema = z.object({
  leads: z.array(z.object({
    name: z.string(),
    contact: z.string().optional(),
    details: z.string().optional()
  }))
});

// Enhanced lead schema with more data fields
const UniversalLeadSchema = z.object({
  leads: z.array(z.object({
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    title: z.string().optional(),
    company: z.string().optional(),
    location: z.string().optional(),
    website: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    social_media: z.object({
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      facebook: z.string().optional(),
      instagram: z.string().optional()
    }).optional(),
    additional_info: z.string().optional()
  }))
});

// Fallback schema for unknown sites
const BookSchema = z.object({
  books: z.array(z.object({
    title: z.string(),
    price: z.string(),
    image: z.string(),
    inStock: z.string(),
    link: z.string(),
  }))
});

// Helper function to get extraction instruction based on industry
function getExtractionInstruction(industry: string, url: string): string {
  const domain = url.toLowerCase();
  
  // Check URL patterns first for auto-detection
  if (domain.includes('shopify') || domain.includes('woocommerce') || 
      domain.includes('store') || domain.includes('shop') || industry === 'ecommerce') {
    return `Extract comprehensive ecommerce business leads from this page. For each business found, provide:
    - name: Store name, brand name, or business owner name
    - email: Primary contact email, sales email, or support email
    - phone: Business phone number with area code
    - title: Owner, CEO, manager, marketing director, or decision maker title
    - company: Full company or store name
    - location: Complete business address, city, state, country
    - website: Main website URL, store URL, or ecommerce platform link
    - description: Detailed description of business model, products, services, target market, and unique selling propositions (2-3 sentences)
    - image: Business logo, storefront photo, or owner profile picture URL
    - social_media: Object with linkedin, twitter, facebook, instagram business accounts
    - additional_info: Comprehensive business details including:
      * Years in business or founded date
      * Number of employees or company size
      * Revenue range or business scale
      * Product categories and inventory size
      * Ecommerce platform used (Shopify, WooCommerce, etc.)
      * Target customer demographics
      * Geographic markets served
      * Fulfillment and shipping capabilities
      * Payment methods accepted
      * Awards, certifications, or recognition
      * Growth stage (startup, established, enterprise)
    
    Focus on decision-makers, business owners, and key contacts for B2B partnerships and services.`;
  }
  
  if (domain.includes('gym') || domain.includes('fitness') || domain.includes('crossfit') ||
      domain.includes('yoga') || domain.includes('pilates') || industry === 'gyms') {
    return `Extract gym and fitness business leads from this page. For each business found, provide:
    - name: Gym name or owner/manager name
    - email: Contact email if available
    - phone: Phone number if available
    - title: Owner, manager, trainer, or staff title
    - company: Gym or studio name
    - location: Address or location
    - website: Website URL
    - description: Type of gym, services offered, or other relevant info
    
    Focus on decision-makers and contact details.`;
  }
  
  if (domain.includes('loan') || domain.includes('mortgage') || domain.includes('lending') ||
      domain.includes('realtor') || domain.includes('broker') || industry === 'loans') {
    return `Extract loan officer and mortgage professional leads from this page. For each professional found, provide:
    - name: Full name of loan officer or mortgage professional
    - email: Contact email if available
    - phone: Phone number if available
    - title: Professional title (Loan Officer, Mortgage Broker, etc.)
    - company: Company or brokerage name
    - location: Service area or location
    - website: Website or profile URL
    - description: Specialties, license info, or experience details
    
    Focus on licensed professionals and decision-makers.`;
  }
  
  // Enhanced comprehensive business extraction
  return `Extract comprehensive business contact leads from this page. For each person or business found, provide:
  - name: Full person name or business name
  - email: Contact email address if available
  - phone: Phone number with area code if available
  - title: Job title, role, or position
  - company: Company or organization name
  - location: Full address, city, state, or service area
  - website: Website or profile URL
  - description: Detailed description of role, business, services, or specialties (2-3 sentences)
  - image: High-resolution profile photo or company logo URL if available
  - social_media: Object containing:
    * linkedin: LinkedIn profile or company page URL
    * twitter: Twitter/X profile URL
    * facebook: Facebook profile or business page URL
    * instagram: Instagram profile URL
  - additional_info: Comprehensive details including:
    * Years of experience
    * Certifications or licenses
    * Specialties or focus areas
    * Company size or revenue
    * Industry or sector
    * Education background
    * Awards or achievements
    * Service areas or markets served
    * Any other relevant professional details
  
  Extract ALL available information thoroughly. Look for:
  - Complete contact details (multiple emails/phones if available)
  - Professional headshots and company logos
  - Social media profiles and business pages
  - Detailed bios and company descriptions
  - Credentials, certifications, and achievements
  - Service offerings and specializations
  - Company information (size, revenue, founded date)
  - Geographic coverage and service areas
  
  Focus on decision-makers, owners, executives, and key contacts with comprehensive B2B outreach data.`;
}

// Fallback extraction using Firecrawl
async function fallbackScraping(url: string, industry: string) {
  if (!process.env.FIRECRAWL_API_KEY) {
    throw new Error('Firecrawl API key not configured');
  }

  const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
  
  try {
    console.log('Using Firecrawl fallback for:', url);
    
    const scrapeResult = await app.scrapeUrl(url, {
      formats: ['extract'],
      extract: {
        prompt: `Extract business lead information from this page. Return a JSON object with "leads" array containing objects with these fields:
        - name: Person or business name
        - contact: Email or phone if found  
        - details: Brief description, title, or other relevant info
        
        Example: {"leads": [{"name": "John Smith", "contact": "john@company.com", "details": "CEO at TechCorp"}]}`,
        schema: SimpleLeadSchema
      }
    });

    if (scrapeResult && 'extract' in scrapeResult && scrapeResult.extract?.leads) {
      return {
        success: true,
        data: scrapeResult.extract.leads.map((lead: any) => ({
          name: lead.name,
          email: lead.contact?.includes('@') ? lead.contact : undefined,
          phone: lead.contact?.match(/[\d\s\-\(\)]+/) && !lead.contact.includes('@') ? lead.contact : undefined,
          description: lead.details,
          lead_score: Math.floor(Math.random() * 30) + 50,
          source_url: url
        })),
        type: industry,
        source_url: url
      };
    }

    return { success: false, error: 'No leads found', data: [] };
  } catch (error) {
    console.error('Firecrawl fallback error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  console.log('Lead Scraping API called');
  
  // Check environment variables first
  if (!process.env.BROWSERBASE_API_KEY) {
    console.error('Missing BROWSERBASE_API_KEY environment variable');
    return NextResponse.json({
      success: false,
      error: 'Missing BROWSERBASE_API_KEY environment variable',
      data: []
    }, { status: 500 });
  }

  if (!process.env.BROWSERBASE_PROJECT_ID) {
    console.error('Missing BROWSERBASE_PROJECT_ID environment variable');
    return NextResponse.json({
      success: false,
      error: 'Missing BROWSERBASE_PROJECT_ID environment variable',
      data: []
    }, { status: 500 });
  }

  if (!process.env.GROQ_API_KEY) {
    console.error('Missing GROQ_API_KEY environment variable');
    return NextResponse.json({
      success: false,
      error: 'Missing GROQ_API_KEY environment variable',
      data: []
    }, { status: 500 });
  }

  let stagehand: Stagehand | null = null;

  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { url, industry } = body;
    
    // Default to books.toscrape.com if no URL provided (for backwards compatibility)
    const targetUrl = url || "https://books.toscrape.com/";
    
    console.log('Environment variables check passed');
    console.log('Target URL:', targetUrl);
    console.log('Industry hint:', industry || 'general');
    
    // Try Stagehand first, with fallback to Firecrawl
    try {
      console.log('Attempting Stagehand extraction...');
      
      // Get extraction instruction
      const instruction = getExtractionInstruction(industry || 'general', targetUrl);
      const schema = targetUrl.includes('books.toscrape.com') ? BookSchema : SimpleLeadSchema;
      
      stagehand = new Stagehand({
        env: "BROWSERBASE",
        verbose: 1, // Increase verbosity for better debugging
        modelName: "groq/llama-3.1-8b-instant", // Using faster model for better reliability
        modelClientOptions: {
          apiKey: process.env.GROQ_API_KEY,
        },
        browserbaseSessionCreateParams: {
          browserSettings: {
            recordSession: true, // Enable session recording
          }
        }
      });

      // Shorter timeouts for quicker fallback
      const initPromise = stagehand.init();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Stagehand initialization timeout')), 20000)
      );
      
      await Promise.race([initPromise, timeoutPromise]);
      const page = stagehand.page;
      
      // Get Live View URL using proper Browserbase SDK
      let liveViewUrl = null;
      let debuggerUrl = null;
      try {
        const sessionId = stagehand.browserbaseSessionID;
        if (sessionId) {
          console.log('Getting live view URL for session:', sessionId);
          
          // Initialize Browserbase SDK
          const bb = new Browserbase({
            apiKey: process.env.BROWSERBASE_API_KEY!,
          });
          
          // Get the proper debugger URL that doesn't require login
          const debugInfo = await bb.sessions.debug(sessionId);
          debuggerUrl = debugInfo.debuggerFullscreenUrl;
          liveViewUrl = debuggerUrl;
          
          console.log('Live view URL obtained:', liveViewUrl);
        }
      } catch (liveViewError) {
        console.warn('Could not get live view URL:', liveViewError);
        // Fallback to session URL if SDK fails
        const sessionId = stagehand.browserbaseSessionID;
        if (sessionId) {
          liveViewUrl = `https://www.browserbase.com/sessions/${sessionId}`;
        }
      }

      const navPromise = page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const navTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Navigation timeout')), 25000)
      );
      
      await Promise.race([navPromise, navTimeoutPromise]);

      const extractPromise = page.extract({
        instruction: instruction,
        schema: schema,
      });
      const extractTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Extraction timeout')), 30000)
      );
      
      const scrape = await Promise.race([extractPromise, extractTimeoutPromise]) as any;

      // Always try to close stagehand
      try {
        await stagehand.close();
      } catch (closeError) {
        console.warn('Error closing stagehand:', closeError);
      }

      if (scrape?.leads?.length > 0 || scrape?.books?.length > 0) {
        console.log('Stagehand extraction successful, found items:', scrape?.leads?.length || scrape?.books?.length || 0);
        
        const data = scrape?.leads || scrape?.books || [];
        const processedData = data.map((item: any) => ({
          ...item,
          lead_score: item.lead_score || Math.floor(Math.random() * 30) + 50,
          source_url: item.source_url || targetUrl
        }));

        return NextResponse.json({
          success: true,
          data: processedData,
          count: processedData.length,
          type: industry || 'general',
          source_url: targetUrl,
          live_view_url: liveViewUrl,
          session_id: stagehand.browserbaseSessionID
        });
      } else {
        throw new Error('No results from Stagehand');
      }

    } catch (stagehandError) {
      console.log('Stagehand failed, trying Firecrawl fallback:', stagehandError instanceof Error ? stagehandError.message : 'Unknown error');
      
      // Always try to close stagehand on error
      if (stagehand) {
        try {
          await stagehand.close();
        } catch (closeError) {
          console.warn('Error closing stagehand after failure:', closeError);
        }
      }

      // Try Firecrawl fallback
      try {
        const fallbackResult = await fallbackScraping(targetUrl, industry || 'general');
        console.log('Firecrawl fallback successful');
        return NextResponse.json({
          ...fallbackResult,
          count: fallbackResult.data.length,
          fallback_used: true
        });
      } catch (fallbackError) {
        console.error('Both Stagehand and Firecrawl failed');
        throw fallbackError;
      }
    }

  } catch (error) {
    console.error('Scraping error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      error: error
    });
    
    // Ensure stagehand is closed even on error
    if (stagehand) {
      try {
        await stagehand.close();
      } catch (closeError) {
        console.error('Error closing stagehand:', closeError);
      }
    }
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: []
    };

    console.log('Returning error response:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}