// Sends transactional emails (verification, password reset) via Resend's
// REST API, called directly with fetch — no SDK/dependency needed, which
// matters given how many "module not found" issues we've hit adding new
// packages in this project's history.
//
// If RESEND_API_KEY isn't set (the default for local dev), this logs the
// email to the console instead of actually sending it. That means the
// whole verification/reset flow is fully testable locally without ever
// signing up for anything — you just read the link out of your terminal
// instead of your inbox. To send real emails, sign up at resend.com
// (free tier), get an API key, and set RESEND_API_KEY in your .env.local
// (or Vercel's environment variables for production).

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log('\n📧 [DEV MODE — no RESEND_API_KEY set] Email not actually sent:');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body:\n${html.replace(/<[^>]+>/g, '')}\n`);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'CampusOS <onboarding@resend.dev>',
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to send email: ${res.status} ${body}`);
  }
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const link = `${APP_URL}/auth/verify?token=${token}`;
  await sendEmail({
    to,
    subject: 'Verify your CampusOS account',
    html: `
      <p>Hi ${name},</p>
      <p>Welcome to CampusOS — confirm your email to activate your account:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const link = `${APP_URL}/auth/reset-password?token=${token}`;
  await sendEmail({
    to,
    subject: 'Reset your CampusOS password',
    html: `
      <p>Hi ${name},</p>
      <p>Someone requested a password reset for your CampusOS account. If this was you, click below:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password won't change.</p>
    `,
  });
}
