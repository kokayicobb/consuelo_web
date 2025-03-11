'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  active: boolean;
  createdAt: string;
  lastUsed?: string;
};

const ApiKeysManagement = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<{ name: string; key: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch API keys
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchKeys();
    }
  }, [status, session]);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/try-on/admin/keys');
      if (!response.ok) throw new Error('Failed to fetch keys');
      
      const data = await response.json();
      setKeys(data);
    } catch (err) {
      setError('Error loading API keys');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    
    try {
      const response = await fetch('/api/try-on/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });
      
      if (!response.ok) throw new Error('Failed to create key');
      
      const data = await response.json();
      setNewKey(data);
      setNewKeyName('');
      fetchKeys();
    } catch (err) {
      setError('Error creating API key');
      console.error(err);
    }
  };

  const deactivateKey = async (id: string) => {
    try {
      const response = await fetch(`/api/try-on/admin/keys?key=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to deactivate key');
      
      fetchKeys();
    } catch (err) {
      setError('Error deactivating API key');
      console.error(err);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Key Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Create New API Key</h2>
        <form onSubmit={createKey} className="space-y-4">
          <div>
            <label htmlFor="key-name" className="block text-sm font-medium text-gray-700">
              Key Name
            </label>
            <input
              id="key-name"
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="e.g., Production API Key"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Create API Key
          </button>
        </form>
        
        {newKey && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-medium text-green-800">API Key Created Successfully</h3>
            <p className="mt-1 text-sm text-gray-600">
              This key will only be displayed once. Please copy it now:
            </p>
            <div className="mt-2 flex">
              <code className="bg-gray-100 p-2 rounded flex-1 break-all">
                {newKey.key}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newKey.key);
                }}
                className="ml-2 text-sm bg-gray-200 p-2 rounded hover:bg-gray-300"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">API Keys</h2>
        
        {loading ? (
          <p>Loading keys...</p>
        ) : keys.length === 0 ? (
          <p>No API keys found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prefix
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {keys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-4 py-3 whitespace-nowrap">{key.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <code>{key.prefix}</code>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {key.lastUsed
                        ? new Date(key.lastUsed).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          key.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {key.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {key.active && (
                        <button
                          onClick={() => deactivateKey(key.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeysManagement;