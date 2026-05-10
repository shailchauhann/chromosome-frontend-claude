// AWS Lambda handler — Chromosome Designs contact form.
//
// Triggered via Lambda Function URL (auth: NONE) routed by CloudFront from
// /api/contact. CloudFront supplies same-origin requests; the CORS headers
// here exist to support direct testing against the Function URL.
//
// Environment variables (set in Lambda console / IaC):
//   AWS_REGION              picked up automatically inside Lambda
//   CONTACT_TO_EMAIL        where enquiries land
//   CONTACT_FROM_EMAIL      verified SES identity, sender address
//   TURNSTILE_SECRET_KEY    Cloudflare Turnstile server-side secret
//   ALLOWED_ORIGIN          (optional) e.g. https://chromosome-designs.com
//
// AWS credentials are NOT in env vars — the Lambda's IAM role provides
// them automatically (see DEPLOY.md → IAM policy).

import { z } from 'zod';
import { sendContactEmail } from './lib/email.mjs';
import { verifyTurnstile } from './lib/turnstile.mjs';
import { rateLimit } from './lib/rate-limit.mjs';

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  projectType: z.string().trim().min(1).max(80),
  budget: z.string().trim().max(80).optional().default(''),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(0).optional().default(''),
  turnstileToken: z.string().min(1).max(2048).optional(),
});

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? '*';

function corsHeaders(origin) {
  return {
    'access-control-allow-origin':
      ALLOWED_ORIGIN === '*' ? '*' : origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'origin',
  };
}

function json(status, body, extraHeaders = {}) {
  return {
    statusCode: status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body),
  };
}

function getClientIp(event) {
  // Lambda Function URL provides sourceIp in requestContext.http
  const forwarded =
    event.headers?.['x-forwarded-for'] ?? event.headers?.['X-Forwarded-For'];
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown';
  return event.requestContext?.http?.sourceIp ?? 'unknown';
}

export async function handler(event) {
  const origin = event.headers?.origin ?? event.headers?.Origin ?? '';
  const cors = corsHeaders(origin);

  // CORS preflight (browsers send this for cross-origin POST + JSON content-type).
  const method = event.requestContext?.http?.method ?? event.httpMethod ?? 'POST';
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }
  if (method !== 'POST') {
    return json(405, { ok: false, error: 'method_not_allowed' }, cors);
  }

  const ip = getClientIp(event);

  // 1. Rate limit per IP — 3 sends per hour. In-memory: per-Lambda-instance
  //    only. AWS will spin up parallel containers under load; for stronger
  //    limits, swap to DynamoDB or Upstash. See DEPLOY.md.
  const rl = rateLimit(`contact:${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return json(
      429,
      { ok: false, error: 'rate_limited' },
      {
        ...cors,
        'retry-after': String(Math.ceil(rl.resetInMs / 1000)),
        'x-ratelimit-remaining': '0',
      },
    );
  }

  // 2. Parse + zod-validate.
  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    return json(400, { ok: false, error: 'invalid_json' }, cors);
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      422,
      { ok: false, error: 'validation', issues: parsed.error.flatten() },
      cors,
    );
  }

  // 3. Honeypot — silently accept and discard so bots don't learn it.
  if (parsed.data.website) {
    console.warn('[contact] honeypot tripped from ip=%s', ip);
    return json(200, { ok: true, delivered: false }, cors);
  }

  // 4. Cloudflare Turnstile verification.
  const turnstile = await verifyTurnstile(parsed.data.turnstileToken, ip);
  if (!turnstile.ok) {
    return json(
      403,
      { ok: false, error: 'captcha_failed', reason: turnstile.reason },
      cors,
    );
  }

  // 5. Send via SES.
  try {
    const result = await sendContactEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      projectType: parsed.data.projectType,
      budget: parsed.data.budget,
      message: parsed.data.message,
    });
    return json(200, { ok: true, delivered: result.delivered }, cors);
  } catch (err) {
    console.error('[contact] send failed:', err);
    return json(502, { ok: false, error: 'send_failed' }, cors);
  }
}
