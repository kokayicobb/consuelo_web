// app/api/emails/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Webhook event types from Resend
interface ResendWebhookEvent {
  type: 'email.sent' | 'email.delivered' | 'email.delivery_delayed' | 
        'email.complained' | 'email.bounced' | 'email.opened' | 'email.clicked';
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    // For bounce events
    bounce?: {
      type: 'permanent' | 'transient' | 'undetermined';
      subtype?: string;
      diagnosticCode?: string;
    };
    // For click events
    click?: {
      url: string;
      userAgent?: string;
      ipAddress?: string;
    };
    // For complaint events
    complaint?: {
      feedbackType?: string;
    };
  };
}

// Verify webhook signature from Resend
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature || !process.env.RESEND_WEBHOOK_SECRET) {
    console.error('Missing webhook signature or secret');
    return false;
  }

  try {
    // Resend sends the signature in the format: "v1=signature"
    const [version, receivedSignature] = signature.split('=');
    if (version !== 'v1') {
      console.error('Invalid signature version');
      return false;
    }

    // Calculate expected signature
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload, 'utf8');
    const expectedSignature = hmac.digest('hex');

    // Timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('resend-signature');

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the webhook event
    const event: ResendWebhookEvent = JSON.parse(body);
    console.log('Received webhook event:', event.type, event.data.email_id);

    // Create Supabase client (server-side, no auth needed for webhooks)
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Process the event based on type
    switch (event.type) {
      case 'email.sent':
        await handleEmailSent(supabase, event);
        break;

      case 'email.delivered':
        await handleEmailDelivered(supabase, event);
        break;

      case 'email.delivery_delayed':
        await handleEmailDelayed(supabase, event);
        break;

      case 'email.opened':
        await handleEmailOpened(supabase, event);
        break;

      case 'email.clicked':
        await handleEmailClicked(supabase, event);
        break;

      case 'email.bounced':
        await handleEmailBounced(supabase, event);
        break;

      case 'email.complained':
        await handleEmailComplained(supabase, event);
        break;

      default:
        console.warn('Unknown webhook event type:', event.type);
    }

    // Return success response
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handler functions for each event type

async function handleEmailSent(supabase: any, event: ResendWebhookEvent) {
  const { error } = await supabase
    .from('emails')
    .update({
      status: 'sent',
      sent_at: event.created_at
    })
    .eq('resend_id', event.data.email_id);

  if (error) {
    console.error('Error updating email sent status:', error);
  }
}

async function handleEmailDelivered(supabase: any, event: ResendWebhookEvent) {
  const { error } = await supabase
    .from('emails')
    .update({
      status: 'delivered',
      delivered_at: event.created_at
    })
    .eq('resend_id', event.data.email_id);

  if (error) {
    console.error('Error updating email delivered status:', error);
  }
}

async function handleEmailDelayed(supabase: any, event: ResendWebhookEvent) {
  // Log the delay but don't change status
  console.log('Email delivery delayed:', event.data.email_id);
  
  // Optionally, you could store this in a separate events table
  await supabase
    .from('email_events')
    .insert({
      email_id: event.data.email_id,
      event_type: 'delivery_delayed',
      created_at: event.created_at
    });
}

async function handleEmailOpened(supabase: any, event: ResendWebhookEvent) {
  // First, get the current open count
  const { data: email, error: fetchError } = await supabase
    .from('emails')
    .select('opens')
    .eq('resend_id', event.data.email_id)
    .single();

  if (fetchError) {
    console.error('Error fetching email:', fetchError);
    return;
  }

  // Update with incremented open count
  const { error } = await supabase
    .from('emails')
    .update({
      status: 'opened',
      opens: (email?.opens || 0) + 1,
      last_opened_at: event.created_at
    })
    .eq('resend_id', event.data.email_id);

  if (error) {
    console.error('Error updating email opened status:', error);
  }

  // Log open event
  await supabase
    .from('email_events')
    .insert({
      email_id: event.data.email_id,
      event_type: 'opened',
      created_at: event.created_at
    });
}

async function handleEmailClicked(supabase: any, event: ResendWebhookEvent) {
  // Get current click count
  const { data: email, error: fetchError } = await supabase
    .from('emails')
    .select('clicks')
    .eq('resend_id', event.data.email_id)
    .single();

  if (fetchError) {
    console.error('Error fetching email:', fetchError);
    return;
  }

  // Update email status and click count
  const { error: updateError } = await supabase
    .from('emails')
    .update({
      status: 'clicked',
      clicks: (email?.clicks || 0) + 1,
      last_clicked_at: event.created_at
    })
    .eq('resend_id', event.data.email_id);

  if (updateError) {
    console.error('Error updating email clicked status:', updateError);
  }

  // Store detailed click information
  if (event.data.click) {
    const { error: clickError } = await supabase
      .from('email_clicks')
      .insert({
        email_id: event.data.email_id,
        url: event.data.click.url,
        clicked_at: event.created_at,
        user_agent: event.data.click.userAgent,
        ip_address: event.data.click.ipAddress
      });

    if (clickError) {
      console.error('Error storing click details:', clickError);
    }
  }
}

async function handleEmailBounced(supabase: any, event: ResendWebhookEvent) {
  // Update email status
  const { error: updateError } = await supabase
    .from('emails')
    .update({
      status: 'bounced',
      bounce_type: event.data.bounce?.type,
      bounce_subtype: event.data.bounce?.subtype,
      bounced_at: event.created_at
    })
    .eq('resend_id', event.data.email_id);

  if (updateError) {
    console.error('Error updating email bounced status:', updateError);
  }

  // Add to suppression list if it's a hard bounce
  if (event.data.bounce?.type === 'permanent' && event.data.to[0]) {
    const { error: suppressionError } = await supabase
      .from('email_suppression_list')
      .insert({
        email: event.data.to[0],
        reason: 'hard_bounce',
        added_at: event.created_at,
        notes: event.data.bounce?.diagnosticCode || 'Permanent bounce detected'
      })
      .onConflict('email,user_id')
      .ignore(); // Ignore if already exists

    if (suppressionError) {
      console.error('Error adding to suppression list:', suppressionError);
    }
  }

  // Log bounce event
  await supabase
    .from('email_events')
    .insert({
      email_id: event.data.email_id,
      event_type: 'bounced',
      event_data: {
        bounce_type: event.data.bounce?.type,
        bounce_subtype: event.data.bounce?.subtype,
        diagnostic_code: event.data.bounce?.diagnosticCode
      },
      created_at: event.created_at
    });
}

async function handleEmailComplained(supabase: any, event: ResendWebhookEvent) {
  // Update email status
  const { error: updateError } = await supabase
    .from('emails')
    .update({
      status: 'complained',
      complained_at: event.created_at
    })
    .eq('resend_id', event.data.email_id);

  if (updateError) {
    console.error('Error updating email complained status:', updateError);
  }

  // Add to suppression list
  if (event.data.to[0]) {
    const { error: suppressionError } = await supabase
      .from('email_suppression_list')
      .insert({
        email: event.data.to[0],
        reason: 'complaint',
        added_at: event.created_at,
        notes: 'User marked email as spam'
      })
      .onConflict('email,user_id')
      .ignore();

    if (suppressionError) {
      console.error('Error adding to suppression list:', suppressionError);
    }
  }

  // Log complaint event
  await supabase
    .from('email_events')
    .insert({
      email_id: event.data.email_id,
      event_type: 'complained',
      event_data: {
        feedback_type: event.data.complaint?.feedbackType
      },
      created_at: event.created_at
    });
}

// Optional: Add a GET method for webhook verification
export async function GET(req: NextRequest) {
  // Some services verify webhooks by sending a GET request
  return NextResponse.json({ 
    status: 'OK',
    message: 'Webhook endpoint is active' 
  });
}