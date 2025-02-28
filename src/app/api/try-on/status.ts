// api/try-on/status.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { validateApiKey, incrementUsage } from './keys';
import { logApiUsage } from './stats';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract API key from headers
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    // Validate API key
    const keyData = await validateApiKey(apiKey);
    if (!keyData) {
      return res.status(403).json({ error: 'Invalid API key' });
    }

    // Get the prediction ID from the query parameters
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Prediction ID is required' });
    }

    // Log the API usage (non-blocking)
    logApiUsage(apiKey, 'status', true).catch(err => {
      console.error('Failed to log API usage:', err);
    });

    // Make request to fashn.ai API
    const response = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB'
      }
    });

    // Get response data from fashn.ai
    const data = await response.json();

    // Check for errors in fashn.ai response
    if (data.error) {
      return res.status(500).json({ 
        error: data.error.message || 'Error from external API',
        source: 'external'
      });
    }

    // Increment usage count (non-blocking)
    incrementUsage(apiKey).catch(err => {
      console.error('Failed to increment usage count:', err);
    });

    // Return the response
    return res.status(200).json(data);
  } catch (error) {
    console.error('Status API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}