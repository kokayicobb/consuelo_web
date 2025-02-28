'use client';

import { useState } from 'react';

const ApiKeyRequestForm = () => {
  const [keyName, setKeyName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);

  const requestApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim() || !purpose.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/try-on/request-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: keyName,
          purpose: purpose
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to request API key');
      }
      
      const data = await response.json();
      setNewKey(data.key);
      setKeyName('');
      setPurpose('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-bold mb-6">Request an API Key</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {newKey ? (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-medium text-green-800">API Key Created Successfully</h3>
            <p className="mt-1 text-sm text-gray-600">
              This key will only be displayed once. Please copy it now:
            </p>
            <div className="mt-2 flex">
              <code className="bg-gray-100 p-2 rounded flex-1 break-all">
                {newKey}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newKey);
                }}
                className="ml-2 text-sm bg-gray-200 p-2 rounded hover:bg-gray-300"
              >
                Copy
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setNewKey(null)}
                className="text-blue-500 hover:text-blue-700"
              >
                Request Another Key
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={requestApiKey} className="space-y-4">
            <div>
              <label htmlFor="key-name" className="block text-sm font-medium text-gray-700">
                Key Name
              </label>
              <input
                id="key-name"
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="e.g., My App API Key"
                required
              />
            </div>
            
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                Purpose
              </label>
              <textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Describe how you'll use this API key"
                rows={3}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Requesting...' : 'Request API Key'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApiKeyRequestForm;