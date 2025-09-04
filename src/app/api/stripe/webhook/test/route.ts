import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook endpoint is working',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Not set',
    stripeKey: process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not set',
  });
}

export async function POST(request: Request) {
  return NextResponse.json({ 
    message: 'POST test successful',
    contentType: request.headers.get('content-type'),
    signature: request.headers.get('stripe-signature') ? 'Present' : 'Missing'
  });
}