// pages/api/shopify/products.js
import axios from 'axios';
import { getAccessTokenFromDB } from '../../../lib/getAccessTokenFromDB';

export default async function handler(req, res) {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).json({ error: 'Missing shop parameter' });
  }

  try {
    const accessToken = await getAccessTokenFromDB(shop);
    if (!accessToken) {
      return res.status(401).json({ error: 'No access token found for this shop' });
    }

    const url = `https://${shop}/admin/api/2023-07/products.json`;
    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Could not fetch products' });
  }
}
