// app/api/places/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Places API
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

interface PlaceSearchRequest {
  query: string;
  location?: {
    lat: number;
    lng: number;
  };
  radius?: number;
  type?: string;
}

interface EnrichedPlace {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string; // To be enriched later
  rating?: number;
  userRatingsTotal?: number;
  businessStatus?: string;
  types?: string[];
  location: {
    lat: number;
    lng: number;
  };
  openingHours?: {
    openNow?: boolean;
    weekdayText?: string[];
  };
  priceLevel?: number;
  photos?: Array<{
    photoReference: string;
    width: number;
    height: number;
  }>;
  // Enrichment placeholders
  linkedIn?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  industry?: string;
  companySize?: string;
  revenue?: string;
  decisionMakers?: Array<{
    name: string;
    title: string;
    email?: string;
    linkedIn?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: PlaceSearchRequest = await request.json();
    const { query, location, radius = 5000, type } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Build the search URL
    let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?`;
    searchUrl += `query=${encodeURIComponent(query)}`;
    searchUrl += `&key=${GOOGLE_MAPS_API_KEY}`;

    if (location) {
      searchUrl += `&location=${location.lat},${location.lng}`;
      searchUrl += `&radius=${radius}`;
    }

    if (type) {
      searchUrl += `&type=${type}`;
    }

    // Add fields we want to retrieve
    searchUrl += `&fields=place_id,name,formatted_address,geometry,rating,user_ratings_total,business_status,types,opening_hours,price_level,photos,formatted_phone_number,website`;

    // Perform the search
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', searchData);
      return NextResponse.json(
        { error: 'Failed to search places', details: searchData.error_message },
        { status: 500 }
      );
    }

    // Process and enrich the results
    const enrichedPlaces: EnrichedPlace[] = await Promise.all(
      (searchData.results || []).slice(0, 20).map(async (place: any) => {
        // Get detailed information for each place
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,business_status,types,geometry,opening_hours,price_level,photos,reviews,editorial_summary&key=${GOOGLE_MAPS_API_KEY}`;
        
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        const details = detailsData.result || {};

        return {
          id: place.place_id,
          name: details.name || place.name,
          address: details.formatted_address || place.formatted_address || '',
          phone: details.formatted_phone_number || details.international_phone_number,
          website: details.website,
          email: null, // To be enriched
          rating: details.rating || place.rating,
          userRatingsTotal: details.user_ratings_total || place.user_ratings_total,
          businessStatus: details.business_status || place.business_status,
          types: details.types || place.types || [],
          location: {
            lat: details.geometry?.location?.lat || place.geometry?.location?.lat,
            lng: details.geometry?.location?.lng || place.geometry?.location?.lng,
          },
          openingHours: {
            openNow: details.opening_hours?.open_now,
            weekdayText: details.opening_hours?.weekday_text,
          },
          priceLevel: details.price_level || place.price_level,
          photos: (details.photos || place.photos || []).slice(0, 3).map((photo: any) => ({
            photoReference: photo.photo_reference,
            width: photo.width,
            height: photo.height,
          })),
          // Enrichment placeholders - these would be filled by external services
          linkedIn: null,
          facebook: null,
          instagram: null,
          twitter: null,
          industry: null,
          companySize: null,
          revenue: null,
          decisionMakers: [],
        };
      })
    );

    return NextResponse.json({
      places: enrichedPlaces,
      nextPageToken: searchData.next_page_token,
      totalResults: enrichedPlaces.length,
    });
  } catch (error) {
    console.error('Error in places search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get more results using pagination token
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageToken = searchParams.get('pagetoken');

    if (!pageToken) {
      return NextResponse.json(
        { error: 'Page token is required' },
        { status: 400 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${pageToken}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: 'Failed to get next page', details: data.error_message },
        { status: 500 }
      );
    }

    // Process results similar to POST method
    const enrichedPlaces: EnrichedPlace[] = await Promise.all(
      (data.results || []).map(async (place: any) => {
        // Similar processing as above
        return {
          id: place.place_id,
          name: place.name,
          address: place.formatted_address || '',
          phone: null, // Will be fetched in details
          website: null,
          email: null,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          businessStatus: place.business_status,
          types: place.types || [],
          location: {
            lat: place.geometry?.location?.lat,
            lng: place.geometry?.location?.lng,
          },
          openingHours: {
            openNow: place.opening_hours?.open_now,
          },
          priceLevel: place.price_level,
          photos: (place.photos || []).slice(0, 3).map((photo: any) => ({
            photoReference: photo.photo_reference,
            width: photo.width,
            height: photo.height,
          })),
        };
      })
    );

    return NextResponse.json({
      places: enrichedPlaces,
      nextPageToken: data.next_page_token,
      totalResults: enrichedPlaces.length,
    });
  } catch (error) {
    console.error('Error getting next page:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}