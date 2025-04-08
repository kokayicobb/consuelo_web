// src/app/api/klaviyo/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getKlaviyoAccountByUserId, deactivateKlaviyoAccount } from '@/lib/db/klaviyo-accounts';

// This endpoint will handle webhooks from Klaviyo for events like uninstalls
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (implement this for production)
    // const isValid = verifyWebhookSignature(request);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
    
    const body = await request.json();
    
    // Process different webhook event types
    const eventType = body.event_type;
    
    if (eventType === 'integration.uninstalled') {
      await handleUninstall(body);
      return NextResponse.json({ success: true });
    }
    
    // Return OK for unhandled event types
    return NextResponse.json({ success: true, message: 'Event received but not processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Handle an uninstall event from Klaviyo
async function handleUninstall(data: any) {
  try {
    // Extract account ID from the webhook payload
    const klaviyoAccountId = data.account_id;
    const userId = data.user_id; // This is a hypothetical field Klaviyo might send
    
    // If we don't have a direct mapping between Klaviyo's account ID and our records,
    // we might need to do a lookup based on other identifiers or use a mapping table
    
    // Find all active Klaviyo accounts for this user and deactivate them
    // This is a simplified approach - in production, you'd want to match the specific account
    const accounts = await getKlaviyoAccountByUserId(userId);
    
    if (!accounts) {
      console.warn(`No active Klaviyo account found for uninstall event: ${klaviyoAccountId}`);
      return;
    }
    
    // Deactivate the account
    await deactivateKlaviyoAccount(accounts.id);
    
    console.log(`Successfully deactivated Klaviyo account ${accounts.id} due to uninstall webhook`);
  } catch (error) {
    console.error('Error handling uninstall webhook:', error);
    // Don't throw here, we still want to return 200 to Klaviyo
  }
}

// This is a stub for webhook signature verification
// You should implement proper verification based on Klaviyo's webhook security model
function verifyWebhookSignature(request: NextRequest): boolean {
  // Implement signature verification logic here
  // For example:
  // const signature = request.headers.get('x-klaviyo-signature');
  // const timestamp = request.headers.get('x-klaviyo-timestamp');
  // const body = await request.text();
  // return validateSignature(signature, timestamp, body);
  
  // For development, return true
  return true;
}