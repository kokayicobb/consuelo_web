// app/api/apollo/search/route.ts - Updated to get more results
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 Apollo API route called');
  
  try {
    const apiKey = process.env.APOLLO_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Apollo API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('📦 Request body:', body);

    // Build search payload with more results
    const apolloPayload: any = {
      page: 1,
      per_page: 100, // ← Increased from 25 to 100 (max allowed)
      reveal_personal_emails: true,
      reveal_phone_number: true,
    };

    if (body.jobTitle && body.jobTitle.trim()) {
      apolloPayload.person_titles = [body.jobTitle.trim()];
    }

    if (body.location && body.location.trim()) {
      apolloPayload.person_locations = [body.location.trim()];
    }

    if (body.industry && body.industry !== 'any') {
      const industryMap: Record<string, string> = {
        'banking': 'Banking',
        'financial services': 'Financial Services',
        'insurance': 'Insurance',
        'real estate': 'Real Estate',
        'technology': 'Technology',
        'healthcare': 'Healthcare',
      };
      
      const mappedIndustry = industryMap[body.industry.toLowerCase()] || body.industry;
      apolloPayload.organization_industries = [mappedIndustry];
    }

    if (body.companySize && body.companySize !== 'any') {
      apolloPayload.organization_num_employees_ranges = [body.companySize];
    }

    console.log('📤 Apollo search payload:', apolloPayload);

    // Search for people
    const searchResponse = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify(apolloPayload),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('❌ Apollo search error:', errorText);
      
      return NextResponse.json(
        { 
          error: 'Apollo search failed',
          status: searchResponse.status,
          message: errorText
        },
        { status: searchResponse.status }
      );
    }

    const searchData = await searchResponse.json();
    console.log('✅ Found', searchData.people?.length || 0, 'people from search');
    console.log('📊 Total available:', searchData.pagination?.total_entries || 0);

    // Process the people data
    const processedPeople = searchData.people?.map((person: any) => {
      // Clean up email
      let email = person.email;
      if (email && email.includes('email_not_unlocked')) {
        email = null;
      }

      // Clean up phone
      let phone = null;
      if (person.phone_numbers && person.phone_numbers.length > 0) {
        phone = person.phone_numbers[0].sanitized_number;
      }

      // Build location
      let location = 'Location not available';
      if (person.city && person.state) {
        location = `${person.city}, ${person.state}`;
      } else if (person.city) {
        location = person.city;
      } else if (person.state) {
        location = person.state;
      }

      return {
        id: person.id,
        first_name: person.first_name,
        last_name: person.last_name,
        name: person.name,
        title: person.title,
        email: email,
        phone: phone,
        location: location,
        organization: person.organization,
        linkedin_url: person.linkedin_url,
      };
    }) || [];

    console.log(`✅ Returning ${processedPeople.length} processed contacts`);

    // Log summary
    const withEmail = processedPeople.filter(p => p.email).length;
    const withPhone = processedPeople.filter(p => p.phone).length;
    console.log(`📊 Contacts with email: ${withEmail}, with phone: ${withPhone}`);

    return NextResponse.json({
      people: processedPeople,
      pagination: searchData.pagination,
      summary: {
        returned: processedPeople.length,
        totalAvailable: searchData.pagination?.total_entries || 0,
        currentPage: searchData.pagination?.page || 1,
        totalPages: searchData.pagination?.total_pages || 1,
        withEmail: withEmail,
        withPhone: withPhone
      }
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const apiKey = process.env.APOLLO_API_KEY;
  return NextResponse.json({ 
    status: 'Apollo API route is working',
    hasApiKey: !!apiKey,
    timestamp: new Date().toISOString()
  });
}