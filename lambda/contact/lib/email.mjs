// SES v2 adapter — delivers contact-form enquiries.
//
// We import @aws-sdk/client-sesv2 from the Lambda runtime's bundled AWS SDK
// (Node 20 runtime ships SDK v3 modular). Don't add it to package.json —
// keeping the deployment zip small.
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

let cachedClient = null;

function getClient() {
  if (!cachedClient) {
    // Region picked up from AWS_REGION env var, set automatically inside
    // Lambda. Credentials come from the Lambda execution role.
    cachedClient = new SESv2Client({});
  }
  return cachedClient;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendContactEmail(payload) {
  const to = process.env.CONTACT_TO_EMAIL ?? 'cavinish@gmail.com';
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!from) {
    // Fail-safe for misconfigured deployments — log instead of throwing so
    // the visitor sees the success state and we get a CloudWatch breadcrumb.
    console.warn('[contact] CONTACT_FROM_EMAIL not set; payload swallowed', {
      ...payload,
      message: payload.message.slice(0, 80),
    });
    return { delivered: false, reason: 'from_not_configured' };
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

  await getClient().send(
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
}
