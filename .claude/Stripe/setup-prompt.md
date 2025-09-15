# Stripe Webhook Setup Prompt

Copy and paste this prompt to quickly set up Stripe webhook testing in GitHub Codespaces:

```
Set up Stripe webhook testing for my GitHub Codespace environment. I need you to:

1. Check if Stripe CLI is installed (install if needed)
2. Verify my Next.js dev server is running on port 3000 (start if needed)
3. Start Stripe webhook forwarding to localhost:3000/api/stripe/webhook
4. Update my .env file with the new webhook secret from the Stripe CLI output
5. Ensure my NEXT_PUBLIC_APP_URL is set to my current GitHub Codespace URL

The setup should allow me to test the full Stripe payment flow including webhook events that update payment records in MongoDB from "pending" to "succeeded" and add credits to users.

Use the TodoWrite tool to track progress through each step.
```

## What This Will Do

This prompt will automatically:
- Install Stripe CLI if not present
- Start webhook forwarding in background
- Capture the webhook signing secret
- Update environment variables
- Verify your dev server is running
- Configure everything for testing payments with real webhook events

## Expected Result

After running this prompt, you'll have:
- Stripe CLI listening for webhook events
- Webhook secret properly configured in .env
- Full payment flow ready for testing
- Database updates working when payments complete

Just copy the prompt above and paste it in a new conversation to quickly recreate this setup!