// api/try-on/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { validateApiKey, incrementUsage } from './keys';
import { logApiUsage } from './stats';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
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

    // Extract request body
    const { 
      model_image,      // base64 encoded user image
      garment_image,    // base64 encoded garment image
      category,         // clothing category
      mode = 'balanced', // processing mode (default: balanced)
      num_samples = 1   // number of samples to generate (default: 1)
    } = req.body;

    // Validate required fields
    if (!model_image || !garment_image || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['model_image', 'garment_image', 'category']
      });
    }

    // Log the API usage (non-blocking)
    logApiUsage(apiKey, 'try-on', true).catch(err => {
      console.error('Failed to log API usage:', err);
    });

    // Make request to fashn.ai API
    const response = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB'
      },
      body: JSON.stringify({
        model_image,
        garment_image,
        category,
        mode,
        num_samples
      })
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
    console.error('Try-on API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}