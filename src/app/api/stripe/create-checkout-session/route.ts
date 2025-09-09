import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import UserCredits from '@/models/UserCredits';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil' as any,
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await request.json();
    
    // Validate that amount is one of the preset options
    const allowedAmounts = [5, 10, 25, 50, 100];
    if (!amount || !allowedAmounts.includes(amount)) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be one of: $5, $10, $25, $50, $100.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get or create user credits record
    let userCredits = await UserCredits.findOne({ clerkUserId: userId });
    
    if (!userCredits) {
      userCredits = new UserCredits({
        clerkUserId: userId,
        credits: 0,
      });
      await userCredits.save();
    }

    // Create Stripe customer if doesn't exist
    let customerId = userCredits.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          clerkUserId: userId,
        },
      });
      
      customerId = customer.id;
      userCredits.stripeCustomerId = customerId;
      await userCredits.save();
    }

    const minutes = Math.floor(amount / 0.15);

    // Create checkout session with single selected item
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card', 'link'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `$${amount} Roleplay Credits`,
            description: `${minutes} minutes of roleplay coaching ($0.15/minute)`,
          },
          unit_amount: amount * 100, // Convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      ui_mode: 'embedded',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/roleplay?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        clerkUserId: userId,
        creditAmount: amount.toString(),
      },
    });

    return NextResponse.json({ 
      clientSecret: session.client_secret
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}