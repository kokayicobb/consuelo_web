// api/try-on/admin/keys.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createApiKey, listApiKeys, deactivateApiKey } from '../keys';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // First verify the user is authenticated as an admin
  const session = await getSession({ req });
  if (!session || !session.user || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return handleGetKeys(req, res);
    case 'POST':
      return handleCreateKey(req, res);
    case 'DELETE':
      return handleDeleteKey(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Handle GET request to list all API keys
 */
async function handleGetKeys(req: NextApiRequest, res: NextApiResponse) {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const keys = await listApiKeys(includeInactive);
    return res.status(200).json(keys);
  } catch (error) {
    console.error('Error listing API keys:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle POST request to create a new API key
 */
async function handleCreateKey(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newKey = await createApiKey(name);
    if (!newKey) {
      return res.status(500).json({ error: 'Failed to create API key' });
    }

    return res.status(201).json(newKey);
  } catch (error) {
    console.error('Error creating API key:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle DELETE request to deactivate an API key
 */
async function handleDeleteKey(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { key } = req.query;
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'API key is required' });
    }

    const success = await deactivateApiKey(key);
    if (!success) {
      return res.status(500).json({ error: 'Failed to deactivate API key' });
    }

    return res.status(200).json({ message: 'API key deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating API key:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}