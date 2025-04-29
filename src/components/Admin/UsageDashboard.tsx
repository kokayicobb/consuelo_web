'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type UsageStats = {
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  requestsByEndpoint: Record<string, number>;
  requestsByDay: Record<string, number>;
};

type KeyUsage = {
  id: string;
  name: string;
  prefix: string;
  requests: number;
};

const UsageDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('30'); // 7, 30, 90 days
  
  const [overallStats, setOverallStats] = useState<UsageStats | null>(null);
  const [keyUsage, setKeyUsage] = useState<KeyUsage[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [keyStats, setKeyStats] = useState<UsageStats | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    } else if (!session || !session.user || (session.user as { role?: string }).role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch overall stats when timeframe changes
  useEffect(() => {
     if (!session || !session.user || (session.user as { role?: string }).role !== 'admin') {
      fetchOverallStats();
      fetchKeyUsage();
    }
  }, [status, session, timeframe]);

  // Fetch key-specific stats when a key is selected
  useEffect(() => {
    if (selectedKeyId) {
      fetchKeyStats(selectedKeyId);
    } else {
      setKeyStats(null);
    }
  }, [selectedKeyId, timeframe]);

  const fetchOverallStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/try-on/admin/usage?days=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setOverallStats(data);
    } catch (err) {
      setError('Error loading usage statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchKeyUsage = async () => {
    try {
      const response = await fetch(`/api/try-on/admin/usage/keys?days=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch key usage');
      
      const data = await response.json();
      setKeyUsage(data);
    } catch (err) {
      setError('Error loading key usage data');
      console.error(err);
    }
  };

  const fetchKeyStats = async (keyId: string) => {
    try {
      const response = await fetch(`/api/try-on/admin/usage/key/${keyId}?days=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch key stats');
      
      const data = await response.json();
      setKeyStats(data);
    } catch (err) {
      setError('Error loading key statistics');
      console.error(err);
    }
  };

  if (!session || !session.user || (session.user as { role?: string }).role !== 'admin') {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Usage Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-1">
          Time Period:
        </label>
        <select
          id="timeframe"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Overall stats cards */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Total Requests</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-3xl font-bold">{overallStats?.totalRequests.toLocaleString() || '0'}</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Average Response Time</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-3xl font-bold">
              {overallStats ? `${Math.round(overallStats.averageResponseTime)}ms` : '0ms'}
            </p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Success Rate</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-3xl font-bold">
              {overallStats ? `${Math.round(overallStats.successRate)}%` : '0%'}
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Endpoints */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Top Endpoints</h2>
          {loading ? (
            <p>Loading...</p>
          ) : !overallStats || Object.keys(overallStats.requestsByEndpoint).length === 0 ? (
            <p>No data available</p>
          ) : (
            <div className="overflow-y-auto max-h-64">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Endpoint
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requests
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(overallStats.requestsByEndpoint)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([endpoint, count]) => (
                      <tr key={endpoint}>
                        <td className="px-4 py-2 whitespace-nowrap">{endpoint}</td>
                        <td className="px-4 py-2 text-right">{count.toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Daily Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Daily Requests</h2>
          {loading ? (
            <p>Loading...</p>
          ) : !overallStats || Object.keys(overallStats.requestsByDay).length === 0 ? (
            <p>No data available</p>
          ) : (
            <div className="overflow-y-auto max-h-64">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requests
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(overallStats.requestsByDay)
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .map(([day, count]) => (
                      <tr key={day}>
                        <td className="px-4 py-2 whitespace-nowrap">{new Date(day).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-right">{count.toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* API Key Usage */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">API Key Usage</h2>
        {keyUsage.length === 0 ? (
          <p>No API key usage data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prefix
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {keyUsage
                  .sort((a, b) => b.requests - a.requests)
                  .map((key) => (
                    <tr key={key.id} className={selectedKeyId === key.id ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-3 whitespace-nowrap">{key.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <code>{key.prefix}</code>
                      </td>
                      <td className="px-4 py-3 text-right">{key.requests.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedKeyId(selectedKeyId === key.id ? null : key.id)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          {selectedKeyId === key.id ? 'Hide Details' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Selected Key Details */}
      {selectedKeyId && keyStats && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Key Details: {keyUsage.find(k => k.id === selectedKeyId)?.name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
              <p className="text-2xl font-bold mt-1">{keyStats.totalRequests.toLocaleString()}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-sm font-medium text-gray-500">Avg Response Time</h3>
              <p className="text-2xl font-bold mt-1">{Math.round(keyStats.averageResponseTime)}ms</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
              <p className="text-2xl font-bold mt-1">{Math.round(keyStats.successRate)}%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Top Endpoints</h3>
              {Object.keys(keyStats.requestsByEndpoint).length === 0 ? (
                <p>No endpoint data available</p>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Endpoint
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requests
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(keyStats.requestsByEndpoint)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([endpoint, count]) => (
                        <tr key={endpoint}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{endpoint}</td>
                          <td className="px-3 py-2 text-right text-sm">{count.toLocaleString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Daily Usage</h3>
              {Object.keys(keyStats.requestsByDay).length === 0 ? (
                <p>No daily data available</p>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requests
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(keyStats.requestsByDay)
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .slice(0, 7)
                      .map(([day, count]) => (
                        <tr key={day}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{new Date(day).toLocaleDateString()}</td>
                          <td className="px-3 py-2 text-right text-sm">{count.toLocaleString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageDashboard;