// app/api/apollo/search-paginated/route.ts - Single page search
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 Apollo paginated search called');
  
  try {
    const apiKey = process.env.APOLLO_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Apollo API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const page = body.page || 1;
    const perPage = body.per_page || 25;
    
    console.log('📦 Request body:', body);
    console.log(`📄 Requesting page ${page} with ${perPage} results per page`);

    // Build search payload
    const searchPayload: any = {
      page: page,
      per_page: perPage,
      // These flags tell Apollo to include emails/phones if available without credits
      reveal_personal_emails: true,
      reveal_phone_number: true,
      // This might help get LinkedIn URLs without credits
      include_linkedin_url: true,
    };

    if (body.jobTitle && body.jobTitle.trim()) {
      searchPayload.person_titles = [body.jobTitle.trim()];
    }

    if (body.location && body.location.trim()) {
      searchPayload.person_locations = [body.location.trim()];
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
      searchPayload.organization_industries = [mappedIndustry];
    }

    if (body.companySize && body.companySize !== 'any') {
      searchPayload.organization_num_employees_ranges = [body.companySize];
    }

    console.log('📤 Sending request to Apollo API...');

    const searchResponse = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify(searchPayload),
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
    console.log(`✅ Found ${searchData.people?.length || 0} people on page ${page}`);

    // Process the people data
    const processedPeople = (searchData.people || []).map((person: any) => {
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
    });

    const withEmail = processedPeople.filter((p: any) => p.email).length;
    const withPhone = processedPeople.filter((p: any) => p.phone).length;

    console.log(`📊 Page ${page} results: ${processedPeople.length} contacts, ${withEmail} with email, ${withPhone} with phone`);

    return NextResponse.json({
      people: processedPeople,
      pagination: {
        page: searchData.pagination?.page || page,
        per_page: searchData.pagination?.per_page || perPage,
        total_entries: searchData.pagination?.total_entries || 0,
        total_pages: searchData.pagination?.total_pages || 0,
      },
      summary: {
        returned: processedPeople.length,
        withEmail: withEmail,
        withPhone: withPhone,
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