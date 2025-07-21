// src/app/api/webhook/firecrawl/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';
import { FirecrawlWebhookPayload } from '../../../../../types/lead-scraper';


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify webhook signature if configured
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-firecrawl-signature');
    
    // Verify signature if webhook secret is configured
    if (process.env.FIRECRAWL_WEBHOOK_SECRET && signature) {
      const isValid = verifyWebhookSignature(
        body,
        signature,
        process.env.FIRECRAWL_WEBHOOK_SECRET
      );
      
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload: FirecrawlWebhookPayload = JSON.parse(body);

    // Extract job ID from webhook metadata
    const jobId = payload.metadata?.jobId;
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID not found in metadata' }, { status: 400 });
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('scraping_jobs')
      .select('*, campaign:scraping_campaigns(*)')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Handle different webhook events
    switch (payload.type) {
      case 'crawl.page':
        // Process individual page data
        if (payload.data && Array.isArray(payload.data)) {
          for (const page of payload.data) {
            await processPageData(job, page);
          }
        }
        break;

      case 'crawl.completed':
        // Update job status to completed
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            stats: {
              leads_found: payload.metadata?.totalLeads || 0,
              pages_scraped: payload.metadata?.totalPages || 0,
              errors: 0
            }
          })
          .eq('id', jobId);

        // Log completion
        await supabase
          .from('scraping_logs')
          .insert({
            job_id: jobId,
            campaign_id: job.campaign_id,
            platform: 'website',
            log_level: 'info',
            message: 'Website crawl completed',
            details: payload.metadata
          });
        break;

      case 'crawl.failed':
        // Update job status to failed
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: payload.error || 'Crawl failed'
          })
          .eq('id', jobId);

        // Log error
        await supabase
          .from('scraping_logs')
          .insert({
            job_id: jobId,
            campaign_id: job.campaign_id,
            platform: 'website',
            log_level: 'error',
            message: 'Website crawl failed',
            details: { error: payload.error }
          });
        break;
    }

    // Deliver webhooks to user if configured
    await deliverUserWebhooks(job.campaign.user_id, payload.type, {
      job_id: jobId,
      campaign_id: job.campaign_id,
      event_type: payload.type,
      data: payload.data,
      metadata: payload.metadata
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function processPageData(job: any, pageData: any) {
  try {
    // Extract structured data from the page
    const leads = extractLeadsFromPage(pageData);
    
    if (leads.length > 0) {
      // Insert leads into database
      const { error } = await supabase
        .from('scraped_leads')
        .insert(
          leads.map(lead => ({
            ...lead,
            campaign_id: job.campaign_id,
            job_id: job.id,
            platform: 'website',
            source_url: pageData.url || pageData.sourceURL,
            source_content: pageData.markdown || pageData.content,
            scraped_data: {
              title: pageData.metadata?.title,
              description: pageData.metadata?.description,
              ...pageData.metadata
            }
          }))
        );

      if (error) {
        console.error('Error inserting leads:', error);
      }
    }
  } catch (error) {
    console.error('Error processing page data:', error);
  }
}

function extractLeadsFromPage(pageData: any): any[] {
  const leads = [];
  
  // Extract emails from content
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = (pageData.markdown || pageData.content || '').match(emailRegex) || [];
  
  // Extract phone numbers
  const phoneRegex = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}/g;
  const phones = (pageData.markdown || pageData.content || '').match(phoneRegex) || [];
  
  // Try to extract structured contact information
  if (emails.length > 0 || phones.length > 0) {
    // Look for names near email addresses
    emails.forEach(email => {
      const lead: any = {
        email: email,
        status: 'new',
        lead_score: 0.4 // Base score for website leads
      };
      
      // Try to extract name from email
      const emailName = email.split('@')[0];
      if (emailName.includes('.')) {
        const parts = emailName.split('.');
        lead.first_name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        lead.last_name = parts[1]?.charAt(0).toUpperCase() + parts[1]?.slice(1);
        lead.full_name = `${lead.first_name} ${lead.last_name || ''}`.trim();
      }
      
      // Add phone if found
      if (phones.length > 0) {
        lead.phone = phones[0];
      }
      
      // Extract company from domain
      const domain = email.split('@')[1];
      if (domain && !domain.includes('gmail') && !domain.includes('yahoo') && !domain.includes('hotmail')) {
        lead.company = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
        lead.website = `https://${domain}`;
      }
      
      leads.push(lead);
    });
  }
  
  // If no emails found but page has contact info metadata
  if (leads.length === 0 && pageData.metadata) {
    const { title, description } = pageData.metadata;
    if (title && (title.toLowerCase().includes('contact') || title.toLowerCase().includes('about'))) {
      leads.push({
        company: pageData.metadata.ogSiteName || pageData.metadata.title,
        website: pageData.url || pageData.sourceURL,
        source_content: description,
        status: 'new',
        lead_score: 0.3
      });
    }
  }
  
  return leads;
}

async function deliverUserWebhooks(userId: string, eventType: string, payload: any) {
  try {
    // Get active webhooks for this user and event
    const { data: webhooks } = await supabase
      .from('webhook_configs')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .contains('events', [eventType]);

    if (!webhooks || webhooks.length === 0) return;

    // Deliver to each webhook
    for (const webhook of webhooks) {
      const delivery = {
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        created_at: new Date().toISOString()
      };

      try {
        // Make webhook request
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': webhook.secret || '',
            ...webhook.headers
          },
          body: JSON.stringify(payload)
        });

        // Record delivery
        await supabase
          .from('webhook_deliveries')
          .insert({
            ...delivery,
            response_status: response.status,
            response_body: await response.text(),
            delivered_at: new Date().toISOString()
          });
      } catch (error) {
        // Record failed delivery
        await supabase
          .from('webhook_deliveries')
          .insert({
            ...delivery,
            response_status: 0,
            response_body: error.message,
            attempts: 1,
            next_retry_at: new Date(Date.now() + 60000).toISOString() // Retry in 1 minute
          });
      }
    }
  } catch (error) {
    console.error('Error delivering webhooks:', error);
  }
}