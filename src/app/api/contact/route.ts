// app/api/contact/route.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Debug API key
    const apiKey = process.env.RESEND_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key starts with re_:', apiKey?.startsWith('re_'));
    console.log('Sending thank you email to:', email);

    // Send thank you email to the user
    const data = await resend.emails.send({
      from: 'Kokayi | CEO & CTO at Consuelo <onboarding@resend.dev>',
      to: [email],
      subject: 'Thank you for joining our waitlist!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #333;">Thank you for joining Consuelo's waitlist!</h2>
          
          <p>Hi there,</p>
          
          <p>Thank you for your interest in Consuelo! We're excited to have you on our waitlist.</p>
          
          <p>We're building something amazing that will help you hire AI employees for your existing work applications stack reliably and finally in one place. No code required, fully customizable.</p>
          
          <p><strong>We'll be in contact when we release.</strong> Please respond to this email to ensure our messages land in your inbox and don't get caught in spam filters.</p>
          
          <p>Best regards,<br>
          Kokayi<br>
          CEO & CTO, Consuelo</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            This email was sent because you signed up for our waitlist at consuelohq.com
          </p>
        </div>
      `
    });

    console.log('Thank you email sent successfully:', data);
    return Response.json({ success: true, data });

  } catch (error) {
    console.error('Failed to send email:', error);
    return Response.json({ 
      error: 'Failed to send message', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}