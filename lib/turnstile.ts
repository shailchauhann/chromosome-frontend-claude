/**
 * Cloudflare Turnstile server-side verification. Called from the contact
 * API route to confirm that the supplied token is real, fresh, and matches
 * our site key before we accept a submission.
 *
 * If TURNSTILE_SECRET_KEY isn't set, verification is skipped — useful for
 * local dev. In production the route refuses to send without it.
 */
import 'server-only';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type VerifyResponse = {
  success: boolean;
  'error-codes'?: string[];
  hostname?: string;
  challenge_ts?: string;
  action?: string;
};

export type TurnstileResult =
  | { ok: true; skipped: false }
  | { ok: true; skipped: true; reason: 'no_secret' }
  | { ok: false; reason: string };

export async function verifyTurnstile(
  token: string | undefined,
  ip?: string,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Dev convenience — skip verification when the secret isn't configured.
    // Production deployments MUST set TURNSTILE_SECRET_KEY.
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

  let data: VerifyResponse;
  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      // Don't cache verification calls — each token is single-use anyway.
      cache: 'no-store',
    });
    data = (await res.json()) as VerifyResponse;
  } catch (err) {
    console.error('[turnstile] network error:', err);
    return { ok: false, reason: 'network_error' };
  }

  if (!data.success) {
    return {
      ok: false,
      reason: `verification_failed:${(data['error-codes'] ?? []).join(',') || 'unknown'}`,
    };
  }
  return { ok: true, skipped: false };
}
