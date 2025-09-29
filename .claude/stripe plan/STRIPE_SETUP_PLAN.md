
# Stripe Setup Plan

Here are the files you need to copy and the steps to set up Stripe in your new Next.js project, exactly as it is here.

### Files to Copy

Copy these files from the current project to the new one, maintaining the same directory structure:

1.  **API Routes for Stripe:**
    *   `src/app/api/stripe/create-checkout-session/route.ts`
    *   `src/app/api/stripe/create-payment-intent/route.ts`
    *   `src/app/api/stripe/session-status/route.ts`
    *   `src/app/api/stripe/verify-payment/route.ts`
    *   `src/app/api/stripe/webhook/route.ts`
    *   `src/app/api/stripe/webhook/test/route.ts`

2.  **Stripe Pricing Data:**
    *   `src/stripe/pricingData.ts`

3.  **Database Models:**
    *   `src/models/Payment.ts`
    *   `src/models/UserCredits.ts`

### Setup Instructions

Follow these steps in your new Next.js project:

1.  **Copy the files** listed above into the corresponding directories.

2.  **Install the necessary npm packages**:
    ```bash
    npm install stripe mongoose
    ```

3.  **Set up your environment variables.** Create a `.env.local` file in the root of your new project and add the following, replacing the placeholder values with your actual credentials:
    ```
    STRIPE_SECRET_KEY=your_stripe_secret_key
    STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
    MONGODB_URI=your_mongodb_connection_string
    ```

4.  **Set up Stripe webhooks.** For local development, you'll need to use the Stripe CLI to forward webhook events to your Next.js app.

    *   **Install the Stripe CLI** (if you haven't already).
    *   **Log in to Stripe** by running `stripe login`.
    *   **Forward webhooks** to your local server with the following command:
        ```bash
        stripe listen --forward-to localhost:3000/api/stripe/webhook
        ```
    *   The CLI will output a webhook signing secret (it will start with `whsec_`). **Copy this secret** and add it as the value for `STRIPE_WEBHOOK_SECRET` in your `.env.local` file.

Once you've completed these steps, your new Next.js project will be configured to handle Stripe payments and webhooks in the same way as the current project.
