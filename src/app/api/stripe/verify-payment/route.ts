import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Payment from '@/models/Payment';
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

    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verify this payment belongs to the authenticated user
    if (paymentIntent.metadata?.clerkUserId !== userId) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Find or create payment record
    let payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntentId,
      clerkUserId: userId
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // Update payment status based on Stripe status
    const previousStatus = payment.status;
    let manuallyProcessed = false;

    switch (paymentIntent.status) {
      case 'succeeded':
        payment.status = 'succeeded';

        // If payment succeeded but credits weren't added, add them now
        if (!payment.creditsAdded) {
          console.log(`🔧 Payment succeeded but credits not added. Processing manually...`);

          const creditAmount = parseFloat(paymentIntent.metadata?.creditAmount || '0');

          if (creditAmount > 0) {
            // Update user credits
            const userCredits = await UserCredits.findOne({ clerkUserId: userId });

            if (userCredits) {
              userCredits.credits += creditAmount;
              await userCredits.save();

              payment.creditsAdded = true;
              manuallyProcessed = true;

              console.log(`✅ Manually added $${creditAmount} credits to user ${userId}. New balance: $${userCredits.credits}`);
            } else {
              console.error(`❌ User credits record not found for user ${userId}`);
            }
          }
        }
        break;
      case 'processing':
        payment.status = 'processing';
        break;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        payment.status = 'pending';
        break;
      case 'canceled':
        payment.status = 'canceled';
        break;
      default:
        payment.status = 'failed';
    }

    await payment.save();

    // Check if credits were actually added to user account
    let creditsAdded = false;
    if (payment.status === 'succeeded') {
      const userCredits = await UserCredits.findOne({ clerkUserId: userId });
      creditsAdded = payment.creditsAdded && userCredits !== null;
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.stripePaymentIntentId,
        status: payment.status,
        amount: payment.amount,
        creditsAdded: creditsAdded,
        statusChanged: previousStatus !== payment.status,
        manuallyProcessed: manuallyProcessed,
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);

    // Handle Stripe errors specifically
    if (error instanceof Stripe.errors.StripeError) {
      if (error.code === 'resource_missing') {
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}