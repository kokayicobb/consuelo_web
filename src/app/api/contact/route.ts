// app/api/contact/route.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.EMAIL_SERVER_PASSWORD);  // 're_Vmgt2q52_L9xBCRRtzhXYRfW2EEC86RPt'

export async function POST(req: Request) {
  try {
    const { fullName, email, phone, message } = await req.json();
    
    console.log('Attempting to send email with:', { fullName, email, phone, message });

    const data = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',  // Format changed to match docs
      to: ['kokayi@consuelo.shop'],  // Changed to array format
      subject: `New Contact Form Submission from ${fullName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    });

    console.log('Email sent successfully:', data);
    return Response.json({ success: true, data });

  } catch (error) {
    console.error('Failed to send email:', error);
    return Response.json({ error: 'Failed to send message' }, { status: 500 });
  }
}