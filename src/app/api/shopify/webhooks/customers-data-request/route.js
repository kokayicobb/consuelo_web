// File: src/app/api/shopify/webhooks/customers-data-request/route.js
// This endpoint handles customer data request webhooks from Shopify

import crypto from 'crypto';
import { NextResponse } from 'next/server';

// In App Router, you export HTTP method functions directly
export async function POST(request) {
  try {
    // Verify webhook is from Shopify
    const isValid = await verifyShopifyWebhook(request);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    // Get the request body
    const data = await request.json();
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
    return NextResponse.json({ message: 'Customer data request received and processing' }, { status: 200 });
  } catch (error) {
    console.error('Error processing customer data request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// You'll need to update this function to work with the App Router request format
async function verifyShopifyWebhook(request) {
  // Get the headers from the request
  const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
  const shopifyDomain = request.headers.get('x-shopify-shop-domain');
  
  if (!hmacHeader) {
    return false;
  }

  try {
    // In App Router, we need to clone the request to read the body
    const body = await request.text();
    
    // Use the Shopify API secret for webhook verification
    const secret = process.env.SHOPIFY_API_SECRET;
    
    // Calculate the HMAC
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('base64');
    
    // Compare the calculated HMAC with the one from the header
    return crypto.timingSafeEqual(
      Buffer.from(hmac),
      Buffer.from(hmacHeader)
    );
  } catch (error) {
    console.error('Error verifying webhook:', error);
    return false;
  }
}

// Implement your logging function
async function logComplianceRequest(data) {
  // Implement your logging logic here
  console.log('Compliance request logged:', data);
}