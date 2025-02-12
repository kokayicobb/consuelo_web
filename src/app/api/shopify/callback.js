import crypto from 'crypto';
import axios from 'axios';

function validateHmac(query, secret) {
  const { hmac, ...params } = query;
  const orderedParams = Object.keys(params).sort().map(key => {
    return `${key}=${params[key]}`;
  }).join('&');

  const hash = crypto
    .createHmac('sha256', secret)
    .update(orderedParams)
    .digest('hex');

  return hash === hmac;
}

export default async function handler(req, res) {
  const { shop, code, hmac, state, host } = req.query;

  if (!shop || !code) {
    return res.status(400).send('Required parameters missing');
  }

  // Verify the HMAC to ensure the request is from Shopify
  const isHmacValid = validateHmac(req.query, process.env.SHOPIFY_API_SECRET);
  if (!isHmacValid) {
    return res.status(400).send('HMAC validation failed');
  }

  try {
    // Exchange the code for a permanent access token
    const tokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
    const tokenPayload = {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    };

    const tokenResponse = await axios.post(tokenRequestUrl, tokenPayload);
    const { access_token, scope } = tokenResponse.data;

    // You would typically store the token, scope, and maybe shop in DB
    // e.g., await storeAccessTokenInDB({ shop, accessToken: access_token, scope });

    // Redirect or respond with success
    // For a typical embedded Shopify app, you might want to redirect to the app inside the Shopify admin
    // e.g. `https://${shop}/admin/apps/your-app-name`
    // Or, for a non-embedded app, just send a success message or custom page
    const redirectUrl = `/?host=${host}&shop=${shop}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Access Token Request Error:', error);
    return res.status(500).send('Error while exchanging code for access token');
  }
}
