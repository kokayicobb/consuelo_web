// app/api/emails/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/supabase/client';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      );
    }

    const { userId, getToken } = await  auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getToken();
    const supabase = createClerkSupabaseClient(token);
    
    const body = await req.json();
    const { to, from, subject, html, text, replyTo, attachments, campaignId, clientId } = body;

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: from || 'noreply@yourdomain.com',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo,
      attachments,
      headers: {
        'X-Campaign-ID': campaignId || '',
        'X-Client-ID': clientId || '',
      },
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Store email record in database
    const { error: dbError } = await supabase
      .from('emails')
      .insert({
        resend_id: data.id,
        from_address: from || 'noreply@yourdomain.com',
        to_addresses: Array.isArray(to) ? to : [to],
        subject,
        body_html: html,
        body_text: text,
        status: 'sent',
        campaign_id: campaignId,
        client_id: clientId,
        sent_at: new Date().toISOString(),
        user_id: userId,
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({ 
      success: true, 
      id: data.id,
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
