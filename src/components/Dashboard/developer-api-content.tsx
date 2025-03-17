"use client";

import { useState } from "react";
import { Copy, Check, Key, RefreshCw, AlertCircle } from "lucide-react";

export default function ConsueloAPIContent() {
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNewKey, setShowNewKey] = useState(false);

  const copyApiKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const requestApiKey = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch('/api/try-on/request-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: "Dashboard Generated Key",
          purpose: "Generated from developer dashboard"
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to request API key');
      }
      
      const data = await response.json();
      setApiKey(data.key);
      setShowNewKey(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const tryOnCodeExample = `
// Example: Try-on API request
const response = await fetch('https://api.consuelo.com/api/try-on', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    model_image: "base64_encoded_image_or_url", // Your model's photo
    garment_image: "base64_encoded_image_or_url", // Garment to try on
    category: "tops" // Valid options: "tops", "bottoms", "one-pieces"
  })
});

const result = await response.json();
// Result contains an ID which can be used to check the status
console.log(result.id);
  `.trim();

  const statusCodeExample = `
// Example: Check status of a try-on request
const response = await fetch('https://api.consuelo.com/api/try-on/status/YOUR_PREDICTION_ID', {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
});

const result = await response.json();
// When status is "completed", the output will contain image URLs
console.log(result.status); // "starting", "processing", "completed", "failed"
console.log(result.output); // Array of image URLs when completed
  `.trim();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-medium">Consuelo API Keys</h2>

        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <Key className="mr-2 h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">Your API Key</span>
            </div>
            <div className="flex items-center gap-2">
              {apiKey && (
                <button
                  onClick={copyApiKey}
                  className="flex items-center gap-1 rounded border border-gray-200 bg-white px-3 py-1.5 text-xs hover:bg-gray-50"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              )}
              <button
                onClick={requestApiKey}
                disabled={loading}
                className="flex items-center gap-1 rounded border border-gray-200 bg-white px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                {apiKey ? "Generate New Key" : "Generate Key"}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-3 flex items-start rounded-md bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {showNewKey && (
            <div className="mb-3 rounded-md bg-green-50 p-3 text-xs text-green-700">
              <p className="mb-1 font-medium">New API key generated!</p>
              <p>This key will only be shown once. Please copy it now.</p>
            </div>
          )}
          
          <div className={`break-all rounded border ${apiKey ? 'border-gray-200 bg-white' : 'border-gray-300 bg-gray-100'} p-3 font-mono text-sm`}>
            {apiKey || "No API key generated yet"}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 text-sm font-medium">API Usage Limits</h3>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-sm text-gray-600">Each API key has the following default limits:</p>
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>25 requests per minute for try-on API</li>
              <li>50 requests per minute for status API</li>
              <li>Contact support for increased limits</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-medium">API Documentation</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-md mb-2 font-medium">Try-on API</h3>
            <p className="mb-4 text-sm text-gray-600">
              The Try-on API allows you to virtually try on garments on model images.
            </p>

            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 text-sm font-medium">Endpoint</h4>
              <div className="rounded border border-gray-200 bg-white p-2 font-mono text-sm">
                POST https://api.consuelo.com/api/try-on
              </div>

              <h4 className="mb-2 mt-4 text-sm font-medium">Headers</h4>
              <div className="space-y-2">
                <div className="rounded border border-gray-200 bg-white p-2 text-sm">
                  <span className="font-medium">x-api-key</span> (required) - Your API key
                </div>
                <div className="rounded border border-gray-200 bg-white p-2 text-sm">
                  <span className="font-medium">Content-Type</span> (required) - application/json
                </div>
              </div>

              <h4 className="mb-2 mt-4 text-sm font-medium">Request Body</h4>
              <div className="space-y-2">
                <div className="rounded border border-gray-200 bg-white p-2 text-sm">
                  <span className="font-medium">model_image</span> (required) - Base64 encoded image or URL of the model
                </div>
                <div className="rounded border border-gray-200 bg-white p-2 text-sm">
                  <span className="font-medium">garment_image</span> (required) - Base64 encoded image or URL of the garment
                </div>
                <div className="rounded border border-gray-200 bg-white p-2 text-sm">
                  <span className="font-medium">category</span> (required) - Type of garment: "tops", "bottoms", or "one-pieces"
                </div>
                <div className="rounded border border-gray-200 bg-white p-2 text-sm">
                  <span className="font-medium">mode</span> (optional) - Processing mode: "performance", "balanced", or "quality" (default: "balanced")
                </div>
                <div className="rounded border border-gray-200 bg-white p-2 text-sm">
                  <span className="font-medium">num_samples</span> (optional) - Number of images to generate (default: 1, max: 4)
                </div>
              </div>

              <h4 className="mb-2 mt-4 text-sm font-medium">Response</h4>
              <div className="rounded border border-gray-200 bg-white p-2 text-sm">
                <pre className="text-xs">
{`{
  "id": "123a87r9-4129-4bb3-be18-9c9fb5bd7fc1-u1",
  "error": null
}`}
                </pre>
              </div>

              <h4 className="mb-2 mt-4 text-sm font-medium">Code Example</h4>
              <div className="overflow-x-auto rounded border border-gray-200 bg-gray-900 p-4 text-gray-100">
                <pre className="text-xs">
                  <code>{tryOnCodeExample}</code>
                </pre>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md mb-2 font-medium">Status API</h3>
            <p className="mb-4 text-sm text-gray-600">
              The Status API allows you to check the status of a try-on request and get the results.
            </p>

            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 text-sm font-medium">Endpoint</h4>
              <div className="rounded border border-gray-200 bg-white p-2 font-mono text-sm">
                GET https://api.consuelo.com/api/try-on/status/:id
              </div>

              <h4 className="mb-2 mt-4 text-sm font-medium">Headers</h4>
              <div className="space-y-2">
                <div className="rounded border border-gray-200 bg-white p-2 text-sm">
                  <span className="font-medium">x-api-key</span> (required) - Your API key
                </div>
              </div>

              <h4 className="mb-2 mt-4 text-sm font-medium">Path Parameters</h4>
              <div className="space-y-2">
                <div className="rounded border border-gray-200 bg-white p-2 text-sm">
                  <span className="font-medium">:id</span> (required) - The prediction ID returned from the try-on API
                </div>
              </div>

              <h4 className="mb-2 mt-4 text-sm font-medium">Response</h4>
              <div className="rounded border border-gray-200 bg-white p-2 text-sm">
                <pre className="text-xs">
{`// Processing
{
  "id": "123a87r9-4129-4bb3-be18-9c9fb5bd7fc1-u1",
  "status": "processing",
  "error": null
}

// Completed
{
  "id": "123a87r9-4129-4bb3-be18-9c9fb5bd7fc1-u1",
  "status": "completed",
  "output": [
    "https://cdn.consuelo.com/123a87r9-4129-4bb3-be18-9c9fb5bd7fc1-u1/output_0.png"
  ],
  "error": null
}`}
                </pre>
              </div>

              <h4 className="mb-2 mt-4 text-sm font-medium">Code Example</h4>
              <div className="overflow-x-auto rounded border border-gray-200 bg-gray-900 p-4 text-gray-100">
                <pre className="text-xs">
                  <code>{statusCodeExample}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}