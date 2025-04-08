// pages/api/klaviyo/connect.js
import { withIronSessionApiRoute } from 'iron-session/next';
import KlaviyoAPI from '../../../utils/klaviyoApi';
import { sessionOptions } from '../../../utils/session';

export default withIronSessionApiRoute(
  async function connectKlaviyoRoute(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }
      
      // Validate the API key by making a request to Klaviyo
      const klaviyoApi = new KlaviyoAPI(apiKey);
      const accountData = await klaviyoApi.getAccounts();
      
      if (!accountData || !accountData.data || accountData.data.length === 0) {
        return res.status(401).json({ error: 'Invalid API key or no accounts found' });
      }
      
      // Store the API key and account info in the session
      req.session.klaviyoApiKey = apiKey;
      req.session.klaviyoAccountId = accountData.data[0].id;
      await req.session.save();
      
      return res.status(200).json({ 
        message: 'Connected to Klaviyo successfully',
        account: accountData.data[0]
      });
    } catch (error) {
      console.error('Failed to connect to Klaviyo:', error);
      return res.status(500).json({ 
        error: 'Failed to connect to Klaviyo',
        details: error.response?.data || error.message
      });
    }
  },
  sessionOptions
);