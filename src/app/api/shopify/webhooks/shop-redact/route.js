import { verifyShopifyWebhook } from '@/utils/shopify'; // Adjust path as needed
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get the raw request body as text
    const rawBody = await request.text();
    
    // Get the HMAC header
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
    
    // Verify the webhook is from Shopify
    const isValid = verifyShopifyWebhook(rawBody, hmacHeader);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' }, 
        { status: 401 }
      );
    }
    
    // Parse the body
    const data = JSON.parse(rawBody);
    console.log('Received shop redact request:', data);
    
    // Process the webhook (implement your business logic here)
    // ...
    
    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing shop redact webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}