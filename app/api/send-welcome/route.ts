import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, name } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'FilmHive <onboarding@resend.dev>', 
      to: [email],
      subject: 'Welcome to FilmHive! 🎬',
      html: `
        <h1>Welcome ${name || 'user'}!</h1>
        <p>Thanks for joining FilmHive. Start building your watchlist now.</p>
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/watchlist">Go to your watchlist</a>
        <p>Happy watching!</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}