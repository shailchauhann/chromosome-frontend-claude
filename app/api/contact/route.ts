import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactEmail } from '@/lib/email';
import { verifyTurnstile } from '@/lib/turnstile';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  projectType: z.string().trim().min(1).max(80),
  budget: z.string().trim().max(80).optional().default(''),
  message: z.string().trim().min(10).max(4000),
  // Honeypot — must be empty.
  website: z.string().max(0).optional().default(''),
  // Cloudflare Turnstile token captured client-side.
  turnstileToken: z.string().min(1).max(2048).optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // 1. Rate limit per IP. Tight window: 3 submissions per hour is
  //    generous for a real visitor, prohibitive for a bot.
  const rl = rateLimit(`contact:${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    const retryAfterSec = Math.ceil(rl.resetInMs / 1000);
    return NextResponse.json(
      { ok: false, error: 'rate_limited' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSec),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  // 2. Parse + zod-validate body.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation', issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  // 3. Honeypot — silently accept and discard. Don't tell the bot it was caught.
  if (parsed.data.website) {
    console.warn('[contact] honeypot tripped from ip=%s', ip);
    return NextResponse.json({ ok: true, delivered: false });
  }

  // 4. Cloudflare Turnstile verification.
  const turnstile = await verifyTurnstile(parsed.data.turnstileToken, ip);
  if (!turnstile.ok) {
    return NextResponse.json(
      { ok: false, error: 'captcha_failed', reason: turnstile.reason },
      { status: 403 },
    );
  }

  // 5. Send via SES (or log if not configured).
  try {
    const result = await sendContactEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      projectType: parsed.data.projectType,
      budget: parsed.data.budget,
      message: parsed.data.message,
    });
    return NextResponse.json({ ok: true, delivered: result.delivered });
  } catch {
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
  }
}
