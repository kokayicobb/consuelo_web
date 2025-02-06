import queryString from 'query-string';

export default async function handler(req, res) {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).send('Missing "shop" parameter.');
  }

  // Construct the Shopify OAuth URL
  // Notice we’re building a query string with required parameters
  const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/shopify/callback`;
  const scopes = process.env.SHOPIFY_SCOPES;
  const apiKey = process.env.SHOPIFY_API_KEY;

  const authorizationUrl = queryString.stringifyUrl({
    url: `https://${shop}/admin/oauth/authorize`,
    query: {
      client_id: apiKey,
      scope: scopes,
      redirect_uri: redirectUri,
    },
  });

  // Redirect the user to the Shopify Authorization page
  return res.redirect(authorizationUrl);
}
