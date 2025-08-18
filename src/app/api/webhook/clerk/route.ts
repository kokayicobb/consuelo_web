// src/app/api/webhooks/clerk/route.ts

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/client"; // Use your existing admin client

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the event type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);

  // ----------------------------------------------------------------
  // ✅ THE IMPORTANT PART: Handle the user.created event
  // ----------------------------------------------------------------
 if (eventType === "user.created") {
    try {
      const supabase = createAdminClient();
      
      // Create the user in Supabase
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email: evt.data.email_addresses[0].email_address,
        email_confirm: true, // Auto-confirm the email
      });

      if (error) {
        throw new Error(`Error creating Supabase user: ${error.message}`);
      }

      // Now, update the Clerk user's public metadata with the Supabase UUID
      const clerkUserId = evt.data.id;
      const supabaseUserId = newUser.user.id;
      
      // Use the newer @clerk/nextjs approach
      const { clerkClient } = await import('@clerk/nextjs/server');
      
      await clerkClient.users.updateUserMetadata(clerkUserId, {
        publicMetadata: {
          supabase_id: supabaseUserId,
        },
      });

      console.log(`Successfully synced Clerk user ${clerkUserId} to Supabase user ${supabaseUserId}`);
      return new Response("OK", { status: 200 });

    } catch (err) {
      console.error("Error in user.created webhook handler:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
}