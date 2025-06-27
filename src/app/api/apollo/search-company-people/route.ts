// app/api/apollo/search-company-people/route.ts
import { NextRequest, NextResponse } from "next/server";

interface SearchParams {
  q_organization_name: string;
  page?: number;
  per_page?: number;
  person_seniorities?: string[];
  person_departments?: string[];
  person_titles?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body: SearchParams = await req.json();
    
    // Validate required fields
    if (!body.q_organization_name?.trim()) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    // Get Apollo API key from environment
    const apolloApiKey = process.env.APOLLO_API_KEY;
    if (!apolloApiKey) {
      console.error("Apollo API key not found in environment variables");
      return NextResponse.json(
        { error: "Apollo API configuration missing" },
        { status: 500 }
      );
    }

    // Build the Apollo API request
    const apolloUrl = "https://api.apollo.io/v1/mixed_people/search";
    
    // Prepare search parameters - REMOVED INVALID SORT CRITERIA
    const searchParams: any = {
      q_organization_name: body.q_organization_name.trim(),
      page: body.page || 1,
      per_page: body.per_page || 25,
      // Include email and contact info
      email_status: ["verified", "guessed", "unavailable"],
      // REMOVED: sort_by_field and sort_ascending (these were causing the 422 error)
    };

    // Add filters if provided
    if (body.person_seniorities && body.person_seniorities.length > 0) {
      searchParams.person_seniorities = body.person_seniorities;
    }

    if (body.person_departments && body.person_departments.length > 0) {
      searchParams.person_departments = body.person_departments;
    }

    if (body.person_titles && body.person_titles.length > 0) {
      searchParams.person_titles = body.person_titles;
    }

    console.log("Apollo API request:", {
      url: apolloUrl,
      params: searchParams,
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
        "X-Api-Key": "***HIDDEN***"
      }
    });

    // Make request to Apollo API
    const apolloResponse = await fetch(apolloUrl, {
      method: "POST",
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
        "X-Api-Key": apolloApiKey,
      },
      body: JSON.stringify(searchParams),
    });

    if (!apolloResponse.ok) {
      const errorText = await apolloResponse.text();
      console.error("Apollo API error:", {
        status: apolloResponse.status,
        statusText: apolloResponse.statusText,
        body: errorText,
      });
      
      let errorMessage = "Apollo API request failed";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch (e) {
        // Error text is not JSON, use generic message
      }

      return NextResponse.json(
        { error: `Apollo API error: ${errorMessage}` },
        { status: apolloResponse.status }
      );
    }

    const apolloData = await apolloResponse.json();
    console.log("Apollo API response received:", {
      contactsCount: apolloData.people?.length || 0,
      pagination: apolloData.pagination,
    });

    // Transform the response to match our interface
    const transformedResponse = {
      contacts: (apolloData.people || []).map((person: any) => ({
        id: person.id,
        first_name: person.first_name,
        last_name: person.last_name,
        name: person.name,
        title: person.title,
        email: person.email,
        phone_numbers: person.phone_numbers || [],
        linkedin_url: person.linkedin_url,
        photo_url: person.photo_url,
        location: person.location,
        city: person.city,
        state: person.state,
        country: person.country,
        headline: person.headline,
        departments: person.departments || [],
        seniority: person.seniority,
        organization: person.organization ? {
          id: person.organization.id,
          name: person.organization.name,
          website_url: person.organization.website_url,
          linkedin_url: person.organization.linkedin_url,
          industry: person.organization.industry,
          estimated_num_employees: person.organization.estimated_num_employees,
          logo_url: person.organization.logo_url,
          city: person.organization.city,
          state: person.organization.state,
          country: person.organization.country,
        } : null,
      })),
      pagination: apolloData.pagination || {
        page: 1,
        per_page: 25,
        total_entries: 0,
        total_pages: 0,
      },
    };

    return NextResponse.json(transformedResponse);

  } catch (error: any) {
    console.error("Company search error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}