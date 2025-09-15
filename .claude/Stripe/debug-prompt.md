# Stripe Webhook Debugging Prompt

Use this prompt with Claude Code to systematically test and fix the Stripe webhook integration:

---

**Task**: Debug and fix Stripe webhook integration that's not updating payment records or adding user credits.

**Context**:
- Stripe payments succeed but MongoDB Payment records stay "pending"
- User credits aren't being added after successful payments
- Webhook endpoint exists but may not be processing events correctly

**Your Mission**:
1. **Setup Environment**: Get the development environment ready for testing
2. **Test Current State**: Run a complete payment flow test to identify exact failure points
3. **Fix Issues**: Systematically resolve each problem found
4. **Verify Fix**: Confirm the entire flow works end-to-end

## Step-by-Step Instructions

### Phase 1: Environment Setup
```bash
# 1. Check if dev server is running
netstat -tlnp | grep :3000

# 2. If not running, start it
npm run dev

# 3. Install Stripe CLI if needed
sudo apt update && sudo apt install stripe

# 4. Authenticate Stripe CLI
stripe login

# 5. Start webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Note the webhook secret output: whsec_xxxxx

# 6. Set environment variable
export STRIPE_WEBHOOK_SECRET=whsec_xxxxx_from_above
```

### Phase 2: Test Current State
```bash
# 1. Test webhook endpoint accessibility
curl -X GET localhost:3000/api/stripe/webhook/test

# 2. Check environment variables are set
echo "Webhook Secret: ${STRIPE_WEBHOOK_SECRET:0:10}..."
echo "Stripe Key: ${STRIPE_SECRET_KEY:0:10}..."

# 3. Test payment creation endpoint
curl -X POST localhost:3000/api/stripe/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 5}' \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### Phase 3: Monitor & Debug
**Run these in parallel terminals:**

Terminal 1: Watch server logs
```bash
# Monitor Next.js server logs for webhook events
tail -f ~/.npm/_logs/*.log
```

Terminal 2: Watch Stripe CLI
```bash
# Monitor Stripe CLI webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Terminal 3: Create test payment and complete it using Stripe test card (4242 4242 4242 4242)

### Phase 4: Expected Outputs to Verify

**Stripe CLI should show:**
```
--> payment_intent.succeeded [evt_xxxxx]
POST /api/stripe/webhook [200]
```

**Server logs should show:**
```
🔔 Webhook received at: [timestamp]
📧 Headers: { signature: 'Present', ... }
✅ Webhook signature verified. Event type: payment_intent.succeeded
💰 Processing payment_intent.succeeded
📋 Payment Intent metadata: { id: 'pi_xxxxx', clerkUserId: 'user_xxxxx', creditAmount: X }
✅ Updated payment record for payment intent pi_xxxxx
✅ Added $X credits to user user_xxxxx
```

### Phase 5: Common Issues & Fixes

**Issue 1: Webhook returns 401/403**
- Check STRIPE_WEBHOOK_SECRET is set correctly
- Verify webhook endpoint is accessible
- Check if authentication middleware is blocking webhooks

**Issue 2: Webhook signature verification fails**
- Ensure webhook secret matches Stripe CLI output exactly
- Check if raw body is being used (not parsed JSON)
- Verify Stripe API version compatibility

**Issue 3: Payment record not found**
- Check payment intent ID matches between creation and webhook
- Verify MongoDB connection is working
- Look for timing issues (webhook arriving before payment record is saved)

**Issue 4: UserCredits not updated**
- Check if UserCredits record exists for the user
- Verify clerkUserId in metadata matches database
- Check for database connection issues

### Phase 6: Systematic Fixes

1. **Fix Webhook Authentication**:
   - Add logging to identify where webhook fails
   - Verify environment variables are loaded
   - Check webhook signature verification logic

2. **Fix Database Updates**:
   - Add transaction handling for atomic updates
   - Improve error handling and logging
   - Add retry logic for database operations

3. **Fix Race Conditions**:
   - Ensure payment record exists before webhook processing
   - Add proper error handling for missing records
   - Consider webhook idempotency

### Phase 7: End-to-End Test
Create a complete test script that:
1. Creates a payment intent
2. Simulates payment completion
3. Verifies payment record is updated
4. Confirms user credits are added
5. Reports success/failure with detailed logs

## Success Criteria
- ✅ Webhook receives and processes payment_intent.succeeded events
- ✅ Payment records update from "pending" to "succeeded"
- ✅ User credits are added correctly
- ✅ All operations complete without errors
- ✅ End-to-end test passes consistently

## Files to Focus On
- `src/app/api/stripe/webhook/route.ts` - Main webhook handler
- `src/app/api/stripe/create-payment-intent/route.ts` - Payment creation
- `src/models/Payment.ts` - Payment model
- `src/models/UserCredits.ts` - Credits model
- `.env.local` - Environment variables

**Run this systematically and don't stop until the entire payment flow works end-to-end.**