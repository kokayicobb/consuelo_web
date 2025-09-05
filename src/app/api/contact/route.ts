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
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fafafa; padding: 30px;">
          
          <!-- Header -->
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #374151; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">
              Welcome to Consuelo!
            </h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; color: #4b5563;">You're on the waitlist</p>
          </div>
          
          <!-- Main content -->
          <div style="background: white; padding: 30px; border-radius: 8px; line-height: 1.6;">
            
            <p style="font-size: 18px; color: #1f2937; margin-bottom: 20px;">Hi there! 👋</p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Thank you for your interest in Consuelo! We're absolutely thrilled to have you on our waitlist.
            </p>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #374151; margin: 25px 0;">
              <p style="margin: 0; font-size: 16px; color: #1f2937; font-weight: 500;">
                We're building something incredible that will help you hire AI employees for your existing work applications stack — reliably and finally in one place. No code required, fully customizable.
              </p>
            </div>
            
            <p style="font-size: 16px; color: #374151; margin: 25px 0;">
              <strong style="color: #1f2937;">We'll be in contact when we release.</strong> Please respond to this email to ensure our future messages land in your inbox and don't get caught in spam filters! 📧
            </p>
            
            <div style="margin: 35px 0 25px 0;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Best regards,</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <table style="width: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                  <tr>
                    <td style="padding-right: 25px; vertical-align: top; width: 50%;">
                      <div style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 6px;">Kokayi Cobb</div>
                      <div style="font-size: 14px; color: #4b5563; font-weight: 500; margin-bottom: 12px;">CEO & CTO</div>
                      <div style="font-size: 16px; font-weight: 600; color: #1f2937;">Consuelo</div>
                    </td>
                    <td style="vertical-align: top; font-size: 14px; color: #374151; line-height: 1.6;">
                      <div style="margin-bottom: 6px;">📱 +1 (980) 406-2191</div>
                      <div style="margin-bottom: 6px;">✉️ Kokayi@consuelohq.com</div>
                      <div>🌐 consuelohq.com</div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280; margin: 0;">
              This email was sent because you signed up for our waitlist at <span style="color: #374151;">consuelohq.com</span>
            </p>
          </div>
          
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