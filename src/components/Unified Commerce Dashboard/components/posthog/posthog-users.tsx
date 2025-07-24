import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, User, Calendar, Search, X, RefreshCw, Activity, Globe, MousePointer } from 'lucide-react';

// Type Definitions for Persons (your website users)
interface PostHogPerson {
  id: string;
  name: string;
  distinct_ids: string[];
  properties: Record<string, any>;
  created_at: string;
  uuid: string;
}

interface PostHogPersonsResponse {
  next: string | null;
  previous: string | null;
  results: PostHogPerson[];
}

interface PostHogEvent {
  id: string;
  distinct_id: string;
  properties: Record<string, any>;
  event: string;
  timestamp: string;
  person?: PostHogPerson;
}

interface PostHogEventsResponse {
  next: string | null;
  previous: string | null;
  results: PostHogEvent[];
}

// Service Layer for PostHog Analytics API
class PostHogAnalyticsService {
  private projectApiKey: string;
  private personalApiKey?: string;
  private baseUrl: string;
  private projectId?: string;

  constructor(projectApiKey: string, personalApiKey?: string, baseUrl: string = 'https://us.posthog.com') {
    this.projectApiKey = projectApiKey;
    this.personalApiKey = personalApiKey;
    this.baseUrl = baseUrl;
  }

  // Helper method for API requests
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Use personal API key for persons endpoint if available
    const apiKey = endpoint.includes('/persons') && this.personalApiKey ? this.personalApiKey : this.projectApiKey;
    
    const response = await fetch(`${this.baseUrl}/api/projects/@current${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Get all persons with better pagination and ordering
  async getPersons(params: Record<string, any> = {}): Promise<PostHogPersonsResponse> {
    // Add ordering to get most recent first, but fetch more
    const enhancedParams = {
      limit: params.limit || 100, // Increased default limit
      ...params
    };
    
    const queryParams = new URLSearchParams(enhancedParams).toString();
    return this.request<PostHogPersonsResponse>(`/persons/?${queryParams}`);
  }

  // Get persons using SQL query for more control
  async getPersonsWithQuery(daysBack: number = 30): Promise<any> {
    const query = {
      query: {
        kind: "HogQLQuery",
        query: `
          SELECT 
            person_id,
            distinct_id,
            properties.$email as email,
            properties.$name as name,
            properties.$geoip_city_name as city,
            properties.$geoip_country_name as country,
            properties.$browser as browser,
            properties.$os as os,
            created_at,
            properties
          FROM persons
          WHERE created_at >= now() - INTERVAL ${daysBack} DAY
          ORDER BY created_at DESC
          LIMIT 1000
        `
      }
    };
    
    return this.request<any>('/query/', {
      method: 'POST',
      body: JSON.stringify(query)
    });
  }

  // Get a specific person by ID
  async getPerson(id: string): Promise<PostHogPerson> {
    return this.request<PostHogPerson>(`/persons/${id}/`);
  }

  // Get events for analysis
  async getEvents(params: Record<string, any> = {}): Promise<PostHogEventsResponse> {
    const queryParams = new URLSearchParams(params).toString();
    return this.request<PostHogEventsResponse>(`/events/?${queryParams}`);
  }

  // Get person's activity
  async getPersonActivity(personId: string): Promise<PostHogEventsResponse> {
    return this.request<PostHogEventsResponse>(`/persons/${personId}/activity/`);
  }
  
  // Fetch all persons across multiple pages
  async getAllPersons(daysBack: number = 30, pageSize: number = 100): Promise<PostHogPerson[]> {
    const allPersons: PostHogPerson[] = [];
    let nextUrl: string | null = null;
    let hasMore = true;
    
    while (hasMore) {
      let response: PostHogPersonsResponse;
      
      if (nextUrl) {
        // Fetch next page using the full URL
        const res = await fetch(nextUrl, {
          headers: {
            'Authorization': `Bearer ${this.personalApiKey || this.projectApiKey}`,
          }
        });
        
        if (!res.ok) {
          throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        
        response = await res.json();
      } else {
        // Initial request
        response = await this.getPersons({
          limit: pageSize,
          offset: 0
        });
      }
      
      allPersons.push(...response.results);
      
      // Check if we have more pages
      nextUrl = response.next;
      hasMore = !!nextUrl && allPersons.length < 1000; // Safety limit
    }
    
    return allPersons;
  }
}

// Props interface
interface PostHogWebsiteUsersProps {
  projectApiKey: string; // This should be your PROJECT API key (starts with phc_)
  personalApiKey?: string; // Optional: Personal API key for better access
  daysBack?: number; // How many days back to fetch users (default: 30)
  pageSize?: number; // Number of users per page (default: 50)
}

// Main Component - Shows YOUR WEBSITE USERS
const PostHogWebsiteUsers: React.FC<PostHogWebsiteUsersProps> = ({ 
  projectApiKey, 
  personalApiKey,
  daysBack = 30,
  pageSize = 50 
}) => {
  const [persons, setPersons] = useState<PostHogPerson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PostHogPerson | null>(null);
  const [personActivity, setPersonActivity] = useState<PostHogEvent[]>([]);
  const [loadingActivity, setLoadingActivity] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    next: null as string | null,
    previous: null as string | null,
    currentPage: 0,
    totalFetched: 0
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<number>(daysBack);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Initialize service
  const service = useMemo(() => new PostHogAnalyticsService(projectApiKey, personalApiKey), [projectApiKey, personalApiKey]);

  useEffect(() => {
    fetchPersons();
  }, [dateRange]);

  const fetchPersons = async (append: boolean = false) => {
    if (!append) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    
    try {
      const offset = append ? pagination.totalFetched : 0;
      const response = await service.getPersons({
        limit: pageSize,
        offset: offset
      });
      
      if (append) {
        setPersons(prev => [...prev, ...response.results]);
      } else {
        setPersons(response.results);
      }
      
      setPagination({
        next: response.next,
        previous: response.previous,
        currentPage: append ? pagination.currentPage + 1 : 0,
        totalFetched: offset + response.results.length
      });
    } catch (err) {
      // If regular API fails, try with HogQL query
      try {
        const queryResponse = await service.getPersonsWithQuery(dateRange);
        const personsFromQuery = queryResponse.results?.map((row: any) => ({
          id: row[0],
          distinct_ids: [row[1]],
          properties: {
            $email: row[2],
            $name: row[3],
            $geoip_city_name: row[4],
            $geoip_country_name: row[5],
            $browser: row[6],
            $os: row[7],
            ...row[9]
          },
          created_at: row[8],
          name: row[3] || row[2],
          uuid: row[0]
        })) || [];
        
        setPersons(personsFromQuery);
        setPagination({
          next: null,
          previous: null,
          currentPage: 0,
          totalFetched: personsFromQuery.length
        });
      } catch (queryErr) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePersons = () => {
    if (pagination.next && !loadingMore) {
      fetchPersons(true);
    }
  };

  const handlePersonClick = async (person: PostHogPerson) => {
    setSelectedPerson(person);
    setLoadingActivity(true);
    
    try {
      const activity = await service.getPersonActivity(person.id);
      setPersonActivity(activity.results);
    } catch (err) {
      console.error('Failed to load activity:', err);
      setPersonActivity([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  // Filter persons based on search
  const filteredPersons = useMemo(() => {
    if (!searchTerm) return persons;

    const term = searchTerm.toLowerCase();
    
    return persons.filter(person => {
      // Search in name
      if (person.name?.toLowerCase().includes(term)) return true;
      
      // Search in distinct IDs
      if (person.distinct_ids.some(id => id.toLowerCase().includes(term))) return true;
      
      // Search in common properties
      const props = person.properties;
      if (props.$email?.toLowerCase().includes(term)) return true;
      if (props.$name?.toLowerCase().includes(term)) return true;
      if (props.$browser?.toLowerCase().includes(term)) return true;
      if (props.$os?.toLowerCase().includes(term)) return true;
      
      return false;
    });
  }, [persons, searchTerm]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayName = (person: PostHogPerson): string => {
    return person.name || 
           person.properties.$name || 
           person.properties.$email || 
           person.distinct_ids[0] || 
           'Anonymous User';
  };

  const getEmail = (person: PostHogPerson): string | null => {
    return person.properties.$email || null;
  };

  const getLocation = (person: PostHogPerson): string => {
    const city = person.properties.$geoip_city_name || person.properties.$city;
    const country = person.properties.$geoip_country_name || person.properties.$country;
    
    if (city && country) return `${city}, ${country}`;
    if (country) return country;
    if (city) return city;
    return 'Unknown';
  };

  const getBrowser = (person: PostHogPerson): string => {
    return person.properties.$browser || 'Unknown';
  };

  const getOS = (person: PostHogPerson): string => {
    return person.properties.$os || 'Unknown';
  };

  if (!projectApiKey) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <AlertCircle className="inline-block mr-2" size={20} />
        Please provide a PostHog PROJECT API key (starts with phc_) to use this component
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
              <User className="mr-2" size={24} />
              Website Users (Persons)
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({pagination.totalFetched} loaded)
              </span>
            </h1>
            <div className="flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={180}>Last 180 days</option>
                <option value={365}>Last year</option>
              </select>
              <button
                onClick={() => fetchPersons()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="mr-2" size={16} />
                Refresh
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, ID..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <AlertCircle className="inline-block mr-2" size={20} />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Users List */}
        {!loading && filteredPersons.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Browser / OS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First Seen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Properties
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPersons.map((person) => (
                  <tr 
                    key={person.id} 
                    onClick={() => handlePersonClick(person)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {getDisplayName(person).charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getDisplayName(person)}
                          </div>
                          {getEmail(person) && (
                            <div className="text-sm text-gray-500">
                              {getEmail(person)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Globe size={14} className="mr-1 text-gray-400" />
                        {getLocation(person)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{getBrowser(person)}</div>
                      <div className="text-xs text-gray-400">{getOS(person)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(person.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {Object.keys(person.properties).length > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {Object.keys(person.properties).length} props
                          </span>
                        )}
                        {person.distinct_ids.length > 1 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {person.distinct_ids.length} IDs
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPersons.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'No users found' : 'No users tracked yet'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? `No users match your search for "${searchTerm}"`
                : 'Users will appear here once they visit your website with PostHog tracking enabled.'}
            </p>
          </div>
        )}

        {/* Load More Button */}
        {!loading && pagination.next && (
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={loadMorePersons}
              disabled={loadingMore}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Loading more...
                </>
              ) : (
                'Load More Users'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Selected Person Details Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
                <button
                  onClick={() => setSelectedPerson(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Display Name</dt>
                      <dd className="text-sm text-gray-900">{getDisplayName(selectedPerson)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Email</dt>
                      <dd className="text-sm text-gray-900">{getEmail(selectedPerson) || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Person ID</dt>
                      <dd className="text-sm text-gray-900 font-mono">{selectedPerson.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">First Seen</dt>
                      <dd className="text-sm text-gray-900">{formatDate(selectedPerson.created_at)}</dd>
                    </div>
                  </dl>
                </div>

                {/* Device & Location */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Device & Location</h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Location</dt>
                      <dd className="text-sm text-gray-900">{getLocation(selectedPerson)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Browser</dt>
                      <dd className="text-sm text-gray-900">{getBrowser(selectedPerson)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Operating System</dt>
                      <dd className="text-sm text-gray-900">{getOS(selectedPerson)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Device Type</dt>
                      <dd className="text-sm text-gray-900">{selectedPerson.properties.$device_type || 'Unknown'}</dd>
                    </div>
                  </dl>
                </div>

                {/* All Properties */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">All Properties</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-gray-700">
                      {JSON.stringify(selectedPerson.properties, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Distinct IDs */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Distinct IDs</h3>
                  <div className="space-y-1">
                    {selectedPerson.distinct_ids.map((id, index) => (
                      <div key={index} className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {id}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                {loadingActivity ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : personActivity.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Activity</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {personActivity.slice(0, 10).map((event) => (
                        <div key={event.id} className="border-l-2 border-gray-200 pl-3 py-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-900">{event.event}</span>
                            <span className="text-xs text-gray-500">{formatDate(event.timestamp)}</span>
                          </div>
                          {event.properties.$current_url && (
                            <div className="text-xs text-gray-600 mt-1">
                              URL: {event.properties.$current_url}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the component and service
export default PostHogWebsiteUsers;
export { PostHogAnalyticsService };
export type { PostHogPerson, PostHogEvent };