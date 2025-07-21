// src/app/api/scraping/leads/enrich/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
     const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { lead_ids } = await request.json();

    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return NextResponse.json(
        { error: 'Lead IDs array is required' },
        { status: 400 }
      );
    }

    // Get leads to enrich (verify ownership)
    const { data: leads, error: leadsError } = await supabase
      .from('scraped_leads')
      .select(`
        *,
        campaign:scraping_campaigns!inner(user_id)
      `)
      .in('id', lead_ids)
      .eq('campaign.user_id', user.id);

    if (leadsError || !leads || leads.length === 0) {
      return NextResponse.json({ error: 'No valid leads found' }, { status: 404 });
    }

    const enrichmentResults = [];
    const errors = [];

    // Process each lead
    for (const lead of leads) {
      try {
        // Skip if already enriched
        if (lead.enrichment_status === 'enriched') {
          continue;
        }

        // Build Apollo search query
        const apolloSearchData: any = {
          page: 1,
          per_page: 1,
          reveal_personal_emails: true,
          reveal_phone_number: true
        };

        // Add search criteria based on available data
        if (lead.full_name) {
          apolloSearchData.person_names = [lead.full_name];
        } else if (lead.first_name && lead.last_name) {
          apolloSearchData.first_name = lead.first_name;
          apolloSearchData.last_name = lead.last_name;
        }

        if (lead.company) {
          apolloSearchData.organization_names = [lead.company];
        }

        if (lead.title) {
          apolloSearchData.person_titles = [lead.title];
        }

        if (lead.linkedin_url) {
          apolloSearchData.linkedin_urls = [lead.linkedin_url];
        }

        // Call Apollo API through our existing endpoint
        const apolloResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/apollo/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
          },
          body: JSON.stringify(apolloSearchData)
        });

        if (!apolloResponse.ok) {
          throw new Error('Apollo search failed');
        }

        const apolloData = await apolloResponse.json();

        if (apolloData.people && apolloData.people.length > 0) {
          const person = apolloData.people[0];

          // Prepare enrichment data
          const enrichmentData = {
            lead_id: lead.id,
            provider: 'apollo',
            work_email: person.email || null,
            personal_email: person.personal_email || null,
            mobile_phone: person.phone || null,
            office_phone: person.office_phone || null,
            company_name: person.organization?.name || lead.company,
            company_domain: person.organization?.domain || null,
            company_size_range: person.organization?.estimated_num_employees || null,
            company_revenue_range: person.organization?.annual_revenue || null,
            company_industry: person.organization?.industry || null,
            company_description: person.organization?.description || null,
            company_founded_year: person.organization?.founded_year || null,
            company_employee_count: person.organization?.num_employees || null,
            seniority_level: person.seniority || null,
            department: person.departments?.join(', ') || null,
            skills: person.skills || [],
            technologies_used: person.organization?.technologies || [],
            raw_data: person,
            enriched_at: new Date().toISOString()
          };

          // Insert enrichment data
          const { error: enrichError } = await supabase
            .from('enrichment_data')
            .insert(enrichmentData);

          if (enrichError) {
            console.error('Error inserting enrichment data:', enrichError);
            errors.push({ lead_id: lead.id, error: 'Failed to save enrichment data' });
          } else {
            // Update lead with enriched data
            const updateData: any = {
              enrichment_status: 'enriched',
              enriched_at: new Date().toISOString()
            };

            // Update contact info if found
            if (person.email && !lead.email) {
              updateData.email = person.email;
            }
            if (person.phone && !lead.phone) {
              updateData.phone = person.phone;
            }
            if (person.linkedin_url && !lead.linkedin_url) {
              updateData.linkedin_url = person.linkedin_url;
            }
            if (person.title && !lead.title) {
              updateData.title = person.title;
            }
            if (person.organization?.name && !lead.company) {
              updateData.company = person.organization.name;
            }

            // Recalculate lead score with enriched data
            updateData.lead_score = calculateEnrichedLeadScore(lead, person);

            const { error: updateError } = await supabase
              .from('scraped_leads')
              .update(updateData)
              .eq('id', lead.id);

            if (updateError) {
              console.error('Error updating lead:', updateError);
              errors.push({ lead_id: lead.id, error: 'Failed to update lead' });
            } else {
              enrichmentResults.push({
                lead_id: lead.id,
                status: 'enriched',
                email_found: !!person.email,
                phone_found: !!person.phone
              });
            }
          }
        } else {
          // No match found
          await supabase
            .from('scraped_leads')
            .update({
              enrichment_status: 'no_data',
              enriched_at: new Date().toISOString()
            })
            .eq('id', lead.id);

          enrichmentResults.push({
            lead_id: lead.id,
            status: 'no_data'
          });
        }
      } catch (error) {
        console.error(`Error enriching lead ${lead.id}:`, error);
        errors.push({
          lead_id: lead.id,
          error: error.message || 'Unknown error'
        });

        // Mark as failed
        await supabase
          .from('scraped_leads')
          .update({
            enrichment_status: 'failed'
          })
          .eq('id', lead.id);
      }
    }

    // Deduct credits from user account
    const enrichedCount = enrichmentResults.filter(r => r.status === 'enriched').length;
    if (enrichedCount > 0) {
      await supabase
        .from('users')
        .update({
          credits_remaining: `credits_remaining - ${enrichedCount}`
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      success: true,
      enriched: enrichmentResults,
      errors: errors.length > 0 ? errors : undefined,
      credits_used: enrichedCount
    });
  } catch (error) {
    console.error('Lead enrichment error:', error);
    return NextResponse.json(
      { error: 'Failed to enrich leads', details: error.message },
      { status: 500 }
    );
  }
}

function calculateEnrichedLeadScore(lead: any, apolloData: any): number {
  let score = lead.lead_score || 0.5;

  // Boost score for having email
  if (apolloData.email && !lead.email) {
    score += 0.15;
  }

  // Boost score for having phone
  if (apolloData.phone && !lead.phone) {
    score += 0.15;
  }

  // Boost score for seniority
  const seniorityBoost = {
    'c_suite': 0.2,
    'vp': 0.15,
    'director': 0.1,
    'manager': 0.05
  };
  if (apolloData.seniority && seniorityBoost[apolloData.seniority]) {
    score += seniorityBoost[apolloData.seniority];
  }

  // Boost for company size (larger companies = higher budget potential)
  if (apolloData.organization?.num_employees) {
    if (apolloData.organization.num_employees > 1000) score += 0.1;
    else if (apolloData.organization.num_employees > 100) score += 0.05;
  }

  return Math.min(score, 1.0);
}