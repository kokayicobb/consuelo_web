// app/api/klaviyo/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';

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
    
    console.log(`Received uninstall webhook for Klaviyo account: ${klaviyoAccountId}, user: ${userId}`);
    
    // TODO: Implement database operations once dependencies are available
    // const accounts = await getKlaviyoAccountByUserId(userId);
    // if (accounts) {
    //   await deactivateKlaviyoAccount(accounts.id);
    //   console.log(`Successfully deactivated Klaviyo account ${accounts.id}`);
    // }
    
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

// Add GET method for testing
export async function GET() {
  return NextResponse.json({
    message: 'Klaviyo webhook endpoint is running',
    method: 'Use POST to send webhook events'
  });
}