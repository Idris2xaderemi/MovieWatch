import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, name } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const watchlistUrl = `${baseUrl}/watchlist`;
  const aboutUrl = `${baseUrl}/about`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to FilmHive</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0a0a0a;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      background-color: #141414;
      border-radius: 16px;
      border: 1px solid #262626;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo svg {
      display: inline-block;
    }
    .logo-text {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.5px;
      margin-left: 8px;
    }
    .logo-text span {
      color: #e50914;
    }
    h1 {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 12px 0;
      color: #fff;
      text-align: center;
    }
    .subhead {
      text-align: center;
      font-size: 18px;
      color: #aaa;
      margin-bottom: 30px;
    }
    .card {
      background: #1a1a1a;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #2a2a2a;
    }
    .card p {
      font-size: 16px;
      line-height: 1.6;
      color: #d0d0d0;
      margin: 0 0 20px 0;
    }
    .btn {
      display: inline-block;
      background: #e50914;
      color: #fff;
      font-weight: 600;
      padding: 12px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 16px;
      box-shadow: 0 8px 24px rgba(229, 9, 20, 0.3);
    }
    .btn:hover {
      background: #f6121d;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-top: 1px solid #262626;
      padding-top: 20px;
    }
    .footer a {
      color: #e50914;
      text-decoration: none;
    }
    .highlight {
      color: #e50914;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Logo -->
    <div class="logo">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="#E50914"/>
        <text x="24" y="32" font-family="Inter, sans-serif" font-size="24" font-weight="700" fill="white" text-anchor="middle">FH</text>
      </svg>
      <span class="logo-text">Film<span>Hive</span></span>
    </div>

    <h1>Welcome aboard, ${name || 'user'}! 🎬</h1>
    <p class="subhead">Your personal movie & series hub is ready.</p>

    <div class="card">
      <p>
        You’ve just joined a community that helps you <strong>discover, track, and rate</strong> everything you watch.
        No more endless scrolling – your next favorite film is just a click away.
      </p>
      <p>
        Start by adding movies to your <span class="highlight">Watchlist</span>, mark what you’ve seen, and share your honest reviews.
      </p>
      <div style="text-align: center;">
        <a href="${watchlistUrl}" class="btn">Go to My Watchlist</a>
      </div>
      <p style="margin-top: 20px; font-size: 14px; color: #888;">
        ⚡ Pro tip: You can also rate movies and write reviews – your feedback helps the whole community.
      </p>
    </div>

    <div class="footer">
      <p>
        Need help? Check our <a href="${aboutUrl}">About</a> page or reply to this email.<br>
        Happy watching! 🍿
      </p>
      <p style="margin-top: 8px; font-size: 12px; color: #444;">
        You are receiving this because you signed up for FilmHive.<br>
        © 2026 FilmHive. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'FilmHive <onboarding@resend.dev>',
      to: [email],
      subject: 'Welcome to FilmHive! 🎬',
      html,
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