import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, User, Building, Calendar, Mail, Shield, Key, RefreshCw, Search, X } from 'lucide-react';

// Type Definitions
interface PostHogTeam {
  id: number;
  uuid: string;
  organization: string;
  project_id: number;
  api_token: string;
  name: string;
  completed_snippet_onboarding: boolean;
  has_completed_onboarding_for: any;
  ingested_event: boolean;
  is_demo: boolean;
  timezone: string;
  access_control: boolean;
}

interface PostHogOrganization {
  id: string;
  name: string;
  slug: string;
  logo_media_id: string;
  created_at: string;
  updated_at: string;
  membership_level: number;
  plugins_access_level: number;
  teams: any[];
  projects: any[];
  available_product_features: any[];
  is_member_join_email_enabled: boolean;
  metadata: string;
  customer_id: string;
  enforce_2fa: boolean;
  members_can_invite: boolean;
  members_can_use_personal_api_keys: boolean;
  member_count: string;
  is_ai_data_processing_approved: boolean;
  default_experiment_stats_method: string;
}

interface PostHogUser {
  date_joined: string;
  uuid: string;
  distinct_id: string;
  first_name: string;
  last_name: string;
  email: string;
  pending_email: string;
  is_email_verified: boolean;
  notification_settings: Record<string, any>;
  anonymize_data: boolean;
  toolbar_mode: string;
  has_password: boolean;
  is_staff: boolean;
  is_impersonated: boolean;
  is_impersonated_until: string;
  sensitive_session_expires_at: string;
  team: PostHogTeam;
  organization: PostHogOrganization;
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    logo_media_id: string;
    membership_level: number;
    members_can_use_personal_api_keys: boolean;
  }>;
  set_current_organization: string;
  set_current_team: string;
  password: string;
  current_password: string;
  events_column_config: any;
  is_2fa_enabled: boolean;
  has_social_auth: boolean;
  has_seen_product_intro_for: any;
  scene_personalisation: Array<{
    scene: string;
    dashboard: number;
  }>;
  theme_mode: 'light' | 'dark' | 'system';
  hedgehog_config: any;
  role_at_organization: string;
}

interface PostHogUsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PostHogUser[];
}

interface PostHogUsersServiceParams {
  is_staff?: boolean;
  limit?: number;
  offset?: number;
}

// Service Layer for PostHog API
class PostHogUsersService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://us.posthog.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  // Helper method for API requests
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get all users with pagination
  async getUsers(params: PostHogUsersServiceParams = {}): Promise<PostHogUsersResponse> {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request<PostHogUsersResponse>(`/users/?${queryParams}`);
  }

  // Get a specific user by UUID
  async getUser(uuid: string): Promise<PostHogUser> {
    return this.request<PostHogUser>(`/users/${uuid}/`);
  }

  // Update a user
  async updateUser(uuid: string, userData: Partial<PostHogUser>): Promise<PostHogUser> {
    return this.request<PostHogUser>(`/users/${uuid}/`, {
      method: 'PATCH',
      body: JSON.stringify(userData)
    });
  }

  // Delete a user
  async deleteUser(uuid: string): Promise<void> {
    await this.request<void>(`/users/${uuid}/`, {
      method: 'DELETE'
    });
  }

  // Get user's 2FA setup
  async getUser2FASetup(uuid: string): Promise<any> {
    return this.request<any>(`/users/${uuid}/start_2fa_setup/`);
  }

  // Generate new backup codes
  async generateBackupCodes(uuid: string): Promise<any> {
    return this.request<any>(`/users/${uuid}/two_factor_backup_codes/`, {
      method: 'POST'
    });
  }
}

// Props interface
interface PostHogUsersProps {
  apiKey: string;
}

// Filter options
type FilterField = 'all' | 'name' | 'email' | 'organization' | 'role';

interface FilterOption {
  value: FilterField;
  label: string;
}

const filterOptions: FilterOption[] = [
  { value: 'all', label: 'All Fields' },
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'organization', label: 'Organization' },
  { value: 'role', label: 'Role' }
];

// Main Component
const PostHogUsers: React.FC<PostHogUsersProps> = ({ apiKey }) => {
  const [users, setUsers] = useState<PostHogUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<PostHogUser | null>(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null
  });
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterField, setFilterField] = useState<FilterField>('all');
  const [showStaffOnly, setShowStaffOnly] = useState<boolean>(false);
  const pageSize = 10;

  // Initialize service
  const service = useMemo(() => new PostHogUsersService(apiKey), [apiKey]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, showStaffOnly]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: PostHogUsersServiceParams = {
        limit: pageSize,
        offset: currentPage * pageSize
      };
      
      if (showStaffOnly) {
        params.is_staff = true;
      }
      
      const response = await service.getUsers(params);
      
      setUsers(response.results);
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term and filter field
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;

    const term = searchTerm.toLowerCase();
    
    return users.filter(user => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const email = user.email.toLowerCase();
      const organization = user.organization?.name?.toLowerCase() || '';
      const role = user.role_at_organization?.toLowerCase() || '';

      switch (filterField) {
        case 'name':
          return fullName.includes(term);
        case 'email':
          return email.includes(term);
        case 'organization':
          return organization.includes(term);
        case 'role':
          return role.includes(term);
        case 'all':
        default:
          return fullName.includes(term) || 
                 email.includes(term) || 
                 organization.includes(term) || 
                 role.includes(term);
      }
    });
  }, [users, searchTerm, filterField]);

  const handleUserClick = (user: PostHogUser) => {
    setSelectedUser(user);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role: string): string => {
    const colors: Record<string, string> = {
      engineering: 'bg-blue-100 text-blue-800',
      product: 'bg-purple-100 text-purple-800',
      marketing: 'bg-green-100 text-green-800',
      sales: 'bg-yellow-100 text-yellow-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || colors.default;
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (!apiKey) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <AlertCircle className="inline-block mr-2" size={20} />
        Please provide a PostHog API key to use this component
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
              PostHog Users
            </h1>
            <button
              onClick={fetchUsers}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="mr-2" size={16} />
              Refresh
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            <select
              value={filterField}
              onChange={(e) => setFilterField(e.target.value as FilterField)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showStaffOnly}
                onChange={(e) => {
                  setShowStaffOnly(e.target.checked);
                  setCurrentPage(0); // Reset to first page
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Staff only</span>
            </label>
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

        {/* Search Results Info */}
        {!loading && searchTerm && (
          <div className="px-6 py-2 bg-gray-50 text-sm text-gray-600">
            Found {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} matching "{searchTerm}"
            {filterField !== 'all' && ` in ${filterOptions.find(o => o.value === filterField)?.label.toLowerCase()}`}
          </div>
        )}

        {/* Users List */}
        {!loading && filteredUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.uuid} 
                    onClick={() => handleUserClick(user)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail size={14} className="mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Building size={14} className="mr-1 text-gray-400" />
                        {user.organization?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role_at_organization)}`}>
                        {user.role_at_organization || 'Member'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        {user.is_staff && (
                          <span className="flex items-center text-orange-600" title="Staff">
                            <Shield size={16} />
                          </span>
                        )}
                        {user.is_2fa_enabled && (
                          <span className="flex items-center text-green-600" title="2FA Enabled">
                            <Key size={16} />
                          </span>
                        )}
                        {user.is_email_verified && (
                          <span className="text-green-600" title="Email Verified">✓</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(user.date_joined)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'No users found' : 'No users available'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? `No users match your search for "${searchTerm}"`
                : 'No users match your current filters or there are no users in the system.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && users.length > 0 && !searchTerm && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={!pagination.previous}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.next}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{currentPage * pageSize + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min((currentPage + 1) * pageSize, pagination.count)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{pagination.count}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={!pagination.previous}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.next}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Personal Information</h3>
                  <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Name</dt>
                      <dd className="text-sm text-gray-900">{selectedUser.first_name} {selectedUser.last_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Email</dt>
                      <dd className="text-sm text-gray-900">{selectedUser.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">UUID</dt>
                      <dd className="text-sm text-gray-900 font-mono">{selectedUser.uuid}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Distinct ID</dt>
                      <dd className="text-sm text-gray-900">{selectedUser.distinct_id}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Organization & Team</h3>
                  <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Organization</dt>
                      <dd className="text-sm text-gray-900">{selectedUser.organization?.name || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Team</dt>
                      <dd className="text-sm text-gray-900">{selectedUser.team?.name || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Role</dt>
                      <dd className="text-sm text-gray-900">{selectedUser.role_at_organization || 'Member'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Membership Level</dt>
                      <dd className="text-sm text-gray-900">{selectedUser.organization?.membership_level || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Security & Settings</h3>
                  <dl className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm font-medium text-gray-600">2FA Enabled</dt>
                      <dd>{selectedUser.is_2fa_enabled ? '✓ Yes' : '✗ No'}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm font-medium text-gray-600">Email Verified</dt>
                      <dd>{selectedUser.is_email_verified ? '✓ Yes' : '✗ No'}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm font-medium text-gray-600">Has Password</dt>
                      <dd>{selectedUser.has_password ? '✓ Yes' : '✗ No'}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm font-medium text-gray-600">Staff User</dt>
                      <dd>{selectedUser.is_staff ? '✓ Yes' : '✗ No'}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm font-medium text-gray-600">Theme Mode</dt>
                      <dd className="capitalize">{selectedUser.theme_mode || 'light'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the component and service
export default PostHogUsers;
export { PostHogUsersService };
export type { PostHogUser, PostHogOrganization, PostHogTeam, PostHogUsersResponse };