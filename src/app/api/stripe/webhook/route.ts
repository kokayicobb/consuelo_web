import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import UserCredits from '@/models/UserCredits';
import Payment from '@/models/Payment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  console.log('🔔 Webhook received at:', new Date().toISOString());

  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    console.log('📧 Headers:', {
      signature: sig ? 'Present' : 'Missing',
      contentType: headersList.get('content-type'),
      bodyLength: body.length
    });

    if (!sig) {
      console.error('❌ Missing stripe-signature header');
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    if (!webhookSecret) {
      console.error('❌ Missing webhook secret');
      return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      console.log('✅ Webhook signature verified. Event type:', event.type);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      console.error('Webhook secret used:', webhookSecret.substring(0, 10) + '...');
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Connect to database with timeout
    try {
      await Promise.race([
        dbConnect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database connection timeout')), 10000)
        )
      ]);
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Handle the event
    console.log(`🎯 Processing event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('💳 Processing checkout.session.completed');
        const session = event.data.object as Stripe.Checkout.Session;

        const clerkUserId = session.metadata?.clerkUserId;
        const creditAmount = parseFloat(session.metadata?.creditAmount || '0');

        console.log(`📋 Session metadata:`, { clerkUserId, creditAmount });

        if (clerkUserId && creditAmount > 0) {
          // Update user credits
          const userCredits = await UserCredits.findOne({ clerkUserId });

          if (userCredits) {
            userCredits.credits += creditAmount;
            await userCredits.save();

            console.log(`✅ Added $${creditAmount} credits to user ${clerkUserId}. New balance: $${userCredits.credits}`);
          } else {
            console.error(`❌ User credits record not found for Clerk user ${clerkUserId}`);
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        console.log('💰 Processing payment_intent.succeeded');
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const clerkUserId = paymentIntent.metadata?.clerkUserId;
        const creditAmount = parseFloat(paymentIntent.metadata?.creditAmount || '0');

        console.log(`📋 Payment Intent metadata:`, {
          id: paymentIntent.id,
          clerkUserId,
          creditAmount,
          allMetadata: paymentIntent.metadata
        });

        if (clerkUserId && creditAmount > 0) {
          // Update payment record
          const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });

          if (payment) {
            payment.status = 'succeeded';
            payment.creditsAdded = true;
            await payment.save();

            console.log(`✅ Updated payment record for payment intent ${paymentIntent.id}`);
          } else {
            console.error(`❌ Payment record not found for payment intent ${paymentIntent.id}`);
          }

          // Update user credits
          const userCredits = await UserCredits.findOne({ clerkUserId });

          if (userCredits) {
            userCredits.credits += creditAmount;
            await userCredits.save();

            console.log(`✅ Added $${creditAmount} credits to user ${clerkUserId}. New balance: $${userCredits.credits}`);
          } else {
            console.error(`❌ User credits record not found for Clerk user ${clerkUserId}`);
          }
        } else {
          console.error('❌ Missing required metadata in payment intent:', paymentIntent.id);
        }
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}