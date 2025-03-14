"use client";

import { useState } from "react";
import { Copy, Check, Key, RefreshCw } from "lucide-react";

export default function DeveloperAPIContent() {
  const [apiKey, setApiKey] = useState("sk_test_fashn_ai_12345678901234567890");
  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateApiKey = () => {
    // This would be an API call in a real implementation
    setApiKey(
      `sk_test_fashn_ai_${Math.random().toString(36).substring(2, 15)}`,
    );
  };

  const codeExample = `
// Example: Try-on API
const response = await fetch('https://api.fashn.ai/v1/try-on', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model_image: 'base64_encoded_model_image',
    garment_image: 'base64_encoded_garment_image',
  }),
});

const result = await response.json();
console.log(result.output_image);
  `.trim();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-medium">API Keys</h2>

        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <Key className="mr-2 h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">Your API Key</span>
            </div>
            <div className="flex items-center gap-2">
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
              <button
                onClick={regenerateApiKey}
                className="flex items-center gap-1 rounded border border-gray-200 bg-white px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </button>
            </div>
          </div>
          <div className="break-all rounded border border-gray-200 bg-white p-3 font-mono text-sm">
            {apiKey}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 text-sm font-medium">API Usage</h3>
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex justify-between">
              <span className="text-sm">This month</span>
              <span className="text-sm font-medium">0 / 100 requests</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-200">
              <div
                className="h-2.5 rounded-full bg-yellow-400"
                style={{ width: "0%" }}
              ></div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Code Example</h3>
          <div className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-gray-100">
            <pre className="text-xs">
              <code>{codeExample}</code>
            </pre>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-medium">API Documentation</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-md mb-2 font-medium">Try-on API</h3>
            <p className="mb-4 text-sm text-gray-600">
              The Try-on API allows you to virtually try on garments on model
              images.
            </p>

            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 text-sm font-medium">Endpoint</h4>
              <div className="rounded border border-gray-200 bg-white p-2 font-mono text-sm">
                POST https://api.fashn.ai/v1/try-on
              </div>

              <h4 className="mb-2 mt-4 text-sm font-medium">Parameters</h4>
              <div className="space-y-2">
                <div className="rounded border border-gray-200 bg-white p-2 text-sm">
                  <span className="font-medium">model_image</span> (required) -
                  Base64 encoded image of the model
                </div>
                <div className="rounded border border-gray-200 bg-white p-2 text-sm">
                  <span className="font-medium">garment_image</span> (required)
                  - Base64 encoded image of the garment
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md mb-2 font-medium">Model Generation API</h3>
            <p className="mb-4 text-sm text-gray-600">
              The Model Generation API allows you to generate AI models based on
              text prompts.
            </p>

            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 text-sm font-medium">Endpoint</h4>
              <div className="rounded border border-gray-200 bg-white p-2 font-mono text-sm">
                POST https://api.fashn.ai/v1/generate-model
              </div>

              <h4 className="mb-2 mt-4 text-sm font-medium">Parameters</h4>
              <div className="space-y-2">
                <div className="rounded border border-gray-200 bg-white p-2 text-sm">
                  <span className="font-medium">prompt</span> (required) - Text
                  description of the model to generate
                </div>
                <div className="rounded border border-gray-200 bg-white p-2 text-sm">
                  <span className="font-medium">num_outputs</span> (optional) -
                  Number of images to generate (default: 1)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
