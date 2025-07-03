// app/api/apollo/search-multiple/route.ts - Get multiple pages
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 Apollo multi-page search called');
  
  try {
    const apiKey = process.env.APOLLO_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Apollo API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const maxResults = body.maxResults || 200; // Allow user to specify max results
    console.log('📦 Request body:', body);
    console.log('🎯 Max results requested:', maxResults);

    // Build base search payload
    const basePayload: any = {
      per_page: 25, // Max per page
      reveal_personal_emails: true,
      reveal_phone_number: true,
    };

    if (body.jobTitle && body.jobTitle.trim()) {
      basePayload.person_titles = [body.jobTitle.trim()];
    }

    if (body.location && body.location.trim()) {
      basePayload.person_locations = [body.location.trim()];
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
      basePayload.organization_industries = [mappedIndustry];
    }

    if (body.companySize && body.companySize !== 'any') {
      basePayload.organization_num_employees_ranges = [body.companySize];
    }

    const allPeople: any[] = [];
    let currentPage = 1;
    let totalPages = 1;
    let totalEntries = 0;

    // Fetch multiple pages until we have enough results
    while (allPeople.length < maxResults && currentPage <= totalPages && currentPage <= 5) { // Limit to 5 pages max
      const pagePayload = {
        ...basePayload,
        page: currentPage
      };

      console.log(`📤 Fetching page ${currentPage}...`);

      const searchResponse = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
        body: JSON.stringify(pagePayload),
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error(`❌ Apollo search error on page ${currentPage}:`, errorText);
        
        if (currentPage === 1) {
          // If first page fails, return error
          return NextResponse.json(
            { 
              error: 'Apollo search failed',
              status: searchResponse.status,
              message: errorText
            },
            { status: searchResponse.status }
          );
        } else {
          // If later page fails, just stop and return what we have
          console.log(`⚠️ Page ${currentPage} failed, stopping with ${allPeople.length} results`);
          break;
        }
      }

      const searchData = await searchResponse.json();
      console.log(`✅ Page ${currentPage}: Found ${searchData.people?.length || 0} people`);
      
      if (currentPage === 1) {
        totalPages = Math.min(searchData.pagination?.total_pages || 1, 5); // Limit to 5 pages
        totalEntries = searchData.pagination?.total_entries || 0;
        console.log(`📊 Total available: ${totalEntries} across ${totalPages} pages`);
      }

      // Add people from this page
      if (searchData.people && searchData.people.length > 0) {
        allPeople.push(...searchData.people);
      } else {
        console.log(`⚠️ Page ${currentPage} returned no people, stopping`);
        break;
      }

      currentPage++;
      
      // Small delay to avoid rate limiting
      if (currentPage <= totalPages) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`✅ Collected ${allPeople.length} total people across ${currentPage - 1} pages`);

    // Process all collected people
    const processedPeople = allPeople.slice(0, maxResults).map((person: any) => {
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

    const withEmail = processedPeople.filter(p => p.email).length;
    const withPhone = processedPeople.filter(p => p.phone).length;

    console.log(`📊 Final results: ${processedPeople.length} contacts, ${withEmail} with email, ${withPhone} with phone`);

    return NextResponse.json({
      people: processedPeople,
      summary: {
        returned: processedPeople.length,
        totalAvailable: totalEntries,
        pagesFetched: currentPage - 1,
        maxResults: maxResults,
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