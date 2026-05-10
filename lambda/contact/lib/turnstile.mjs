// Cloudflare Turnstile server-side verification.
//
// In dev (no TURNSTILE_SECRET_KEY), verification is skipped. In production
// (NODE_ENV === 'production'), missing secret is a hard fail.

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, reason: 'secret_missing_in_production' };
    }
    return { ok: true, skipped: true, reason: 'no_secret' };
  }

  if (!token) {
    return { ok: false, reason: 'token_missing' };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);

  let data;
  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });
    data = await res.json();
  } catch (err) {
    console.error('[turnstile] network error:', err);
    return { ok: false, reason: 'network_error' };
  }

  if (!data?.success) {
    return {
      ok: false,
      reason: `verification_failed:${(data?.['error-codes'] ?? []).join(',') || 'unknown'}`,
    };
  }

  return { ok: true, skipped: false };
}
