# Stripe Integration Guide

## How It Works

### Payment Flow
1. **Frontend**: User enters amount → calls `/api/stripe/create-payment-intent`
2. **Backend**: Creates PaymentIntent in Stripe + Payment record in MongoDB (status: "pending")
3. **Frontend**: User completes payment via Stripe Elements
4. **Stripe**: Sends `payment_intent.succeeded` webhook to your server
5. **Webhook**: Updates Payment record (status: "succeeded") + adds credits to user

### Key Components

#### 1. Payment Creation (`/api/stripe/create-payment-intent`)
- Creates Stripe PaymentIntent with metadata
- Creates MongoDB Payment record with `status: "pending"`
- Returns client_secret for frontend

#### 2. Webhook Handler (`/api/stripe/webhook`)
- Listens for `payment_intent.succeeded` events
- Updates Payment record: `status: "succeeded"`, `creditsAdded: true`
- Adds credits to UserCredits collection

#### 3. Database Models
- **Payment**: Tracks individual transactions
- **UserCredits**: Tracks user's credit balance

## Testing in GitHub Codespaces

### Prerequisites
```bash
# 1. Install Stripe CLI
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update && sudo apt install stripe

# 2. Start your Next.js dev server
npm run dev
```

### Setup Webhook Forwarding
```bash
# 1. Authenticate Stripe CLI (follow prompts)
stripe login

# 2. Start webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will output a webhook secret like:
```
Your webhook signing secret is whsec_xxxxx
```

### Set Environment Variable
```bash
# Set the webhook secret from Stripe CLI output
export STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Test Payment Flow
1. **Create Payment**: Make POST to `/api/stripe/create-payment-intent`
2. **Complete Payment**: Use Stripe test card (4242 4242 4242 4242)
3. **Check Logs**: Watch both server logs and Stripe CLI output
4. **Verify Database**: Check Payment record status and UserCredits balance

### Expected Webhook Logs
When working correctly, you should see:
```
🔔 Webhook received at: [timestamp]
📧 Headers: { signature: 'Present', contentType: 'application/json', bodyLength: xxxx }
✅ Webhook signature verified. Event type: payment_intent.succeeded
🎯 Processing event: payment_intent.succeeded
💰 Processing payment_intent.succeeded
📋 Payment Intent metadata: { id: 'pi_xxxxx', clerkUserId: 'user_xxxxx', creditAmount: X }
✅ Updated payment record for payment intent pi_xxxxx
✅ Added $X credits to user user_xxxxx. New balance: $XX
```

## Troubleshooting

### Common Issues

1. **401 Webhook Errors**
   - Webhook endpoint not accessible
   - Wrong webhook secret
   - Server not running

2. **Payment Records Stay "pending"**
   - Webhook not receiving events
   - Webhook failing to process
   - Wrong payment intent ID

3. **Credits Not Added**
   - UserCredits record not found
   - Webhook processing but failing on credit update

### Debug Steps
1. Check server is running on port 3000
2. Verify Stripe CLI is forwarding webhooks
3. Check webhook secret matches environment variable
4. Look for webhook processing logs
5. Verify Payment record exists with correct payment intent ID
6. Check UserCredits record exists for the user

### Test Commands
```bash
# Check server status
netstat -tlnp | grep :3000

# Check Stripe CLI status
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test webhook endpoint
curl -X GET localhost:3000/api/stripe/webhook/test

# Check environment variables
echo $STRIPE_WEBHOOK_SECRET
echo $STRIPE_SECRET_KEY
```

## File Structure
```
src/app/api/stripe/
├── create-payment-intent/route.ts    # Creates PaymentIntent + Payment record
├── webhook/route.ts                  # Handles payment_intent.succeeded
├── webhook/test/route.ts             # Test endpoint
└── verify-payment/route.ts           # Manual payment verification
```

## Environment Variables Required
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret (from Stripe CLI)
- `MONGODB_URI`: MongoDB connection string