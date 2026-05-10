/**
 * Email adapter — Amazon SES v2. Single seam for the rest of the app to send
 * mail through; if you swap providers later, only this file changes.
 *
 * Auth picked up from the AWS SDK's default credential chain — typically
 * the env vars AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY. On
 * Vercel deploy, set them in Project Settings → Environment Variables.
 *
 * SES requirements:
 *   1. The `from` address must be a verified identity in your SES region.
 *   2. New AWS accounts are in the SES sandbox — recipients must also be
 *      verified. Request production access in the SES console to lift this.
 */
import 'server-only';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

export type ContactPayload = {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
};

let cachedClient: SESv2Client | null = null;

function getClient(): SESv2Client | null {
  // If creds aren't configured, return null — the route logs and returns
  // success-without-delivery so dev environments work without AWS.
  if (
    !process.env.AWS_REGION ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY
  ) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = new SESv2Client({ region: process.env.AWS_REGION });
  }
  return cachedClient;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Send a contact-form enquiry. Returns { delivered: true } on success. */
export async function sendContactEmail(
  payload: ContactPayload,
): Promise<{ delivered: boolean; reason?: string }> {
  const client = getClient();
  const to = process.env.CONTACT_TO_EMAIL ?? 'cavinish@gmail.com';
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!client || !from) {
    console.log('[contact] AWS SES not configured; payload:', {
      ...payload,
      // Don't log the message body in full — could be PII-heavy.
      message: payload.message.slice(0, 80) + (payload.message.length > 80 ? '…' : ''),
    });
    return { delivered: false, reason: 'ses_not_configured' };
  }

  const subject = `New enquiry · ${payload.projectType} · ${payload.name}`;
  const text = [
    `From: ${payload.name} <${payload.email}>`,
    `Project type: ${payload.projectType}`,
    `Budget: ${payload.budget || '—'}`,
    '',
    payload.message,
  ].join('\n');

  const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; color:#1a1a1a; max-width:640px;">
      <h2 style="color:#A77F0E; font-family: Georgia, serif; margin-bottom: 8px;">New enquiry</h2>
      <p style="color:#666; margin: 0 0 24px 0;">Submitted via chromosome-designs.com</p>
      <table cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:14px;">
        <tr><td style="color:#666; width:140px;">From</td><td><strong>${escapeHtml(payload.name)}</strong> &lt;${escapeHtml(payload.email)}&gt;</td></tr>
        <tr><td style="color:#666;">Project type</td><td>${escapeHtml(payload.projectType)}</td></tr>
        <tr><td style="color:#666;">Budget</td><td>${escapeHtml(payload.budget) || '&mdash;'}</td></tr>
      </table>
      <h3 style="margin-top:32px; font-family: Georgia, serif;">Message</h3>
      <p style="white-space:pre-wrap; line-height:1.6;">${escapeHtml(payload.message)}</p>
    </div>
  `;

  try {
    await client.send(
      new SendEmailCommand({
        FromEmailAddress: `Chromosome Designs <${from}>`,
        Destination: { ToAddresses: [to] },
        ReplyToAddresses: [payload.email],
        Content: {
          Simple: {
            Subject: { Data: subject, Charset: 'UTF-8' },
            Body: {
              Text: { Data: text, Charset: 'UTF-8' },
              Html: { Data: html, Charset: 'UTF-8' },
            },
          },
        },
      }),
    );
    return { delivered: true };
  } catch (err) {
    // Re-throw so the route returns 502 — but log enough to debug SES errors.
    const e = err as { name?: string; message?: string };
    console.error('[contact] SES send error:', e.name, e.message);
    throw err;
  }
}
