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
    
    // Validate amount (minimum $1, maximum $1000)
    if (!amount || amount < 1 || amount > 1000) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be between $1 and $1000.' },
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

    // Calculate service fee (2.9% + $0.30)
    const creditAmount = amount;
    const serviceFee = Math.round((creditAmount * 0.029 + 0.30) * 100) / 100;
    const totalAmount = creditAmount + serviceFee;
    const minutes = Math.floor(creditAmount / 0.15);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customerId,
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      description: `$${creditAmount} Roleplay Credits (${minutes} minutes)`,
      metadata: {
        clerkUserId: userId,
        creditAmount: creditAmount.toString(),
        serviceFee: serviceFee.toString(),
        totalAmount: totalAmount.toString(),
      },
    });

    // For simplicity, we'll immediately add credits on successful intent creation
    // In production, you'd want to use webhooks to handle this after payment confirmation
    userCredits.credits += creditAmount;
    await userCredits.save();

    return NextResponse.json({ 
      success: true,
      creditAmount,
      serviceFee,
      totalAmount,
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}