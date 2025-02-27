// File: api/webhooks/customers-data-request.js
// This endpoint handles customer data request webhooks from Shopify

import crypto from 'crypto';

export default async function handler(req, res) {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify webhook is from Shopify
    const isValid = verifyShopifyWebhook(req);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const data = req.body;
    console.log('Received customer data request:', data);

    // IMPLEMENTATION NEEDED:
    // 1. Extract customer info from the webhook payload
    // 2. Query your database for all data related to this customer
    // 3. Package this data in a compliant format
    // 4. Either respond directly or send data to the customer via secure means

    // Log the request for audit purposes
    await logComplianceRequest({
      type: 'customers/data_request',
      shopDomain: data.shop_domain,
      shopId: data.shop_id,
      customerId: data.customer.id,
      requestId: data.id,
      timestamp: new Date()
    });

    // Return 200 to acknowledge receipt of the webhook
    return res.status(200).json({ message: 'Customer data request received and processing' });
  } catch (error) {
    console.error('Error processing customer data request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}