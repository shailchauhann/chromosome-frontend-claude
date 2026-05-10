/**
 * Simple per-IP rate limiter, in-memory.
 *
 * Important caveat: on serverless platforms (Vercel, AWS Lambda), each
 * function invocation can run in a different worker, so this Map is
 * per-instance. It will catch a single hammering bot from one IP hitting
 * the same instance, but a distributed attack across instances will leak.
 *
 * For production-grade limits across instances, swap to Upstash Redis or
 * Vercel KV — keep the same `check()` signature so callers don't change.
 *
 * Memory is bounded: stale buckets are evicted on each call once they
 * expire. With a 1-hour window and reasonable traffic the Map stays small.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetInMs: number;
};

export function rateLimit(
  key: string,
  options: { limit?: number; windowMs?: number } = {},
): RateLimitResult {
  const limit = options.limit ?? 3;
  const windowMs = options.windowMs ?? 60 * 60 * 1000; // 1 hour
  const now = Date.now();

  // Opportunistic eviction if we're getting big.
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) {
      if (b.resetAt < now) buckets.delete(k);
      if (buckets.size <= MAX_BUCKETS / 2) break;
    }
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetInMs: windowMs };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, resetInMs: existing.resetAt - now };
  }

  existing.count++;
  return {
    ok: true,
    remaining: limit - existing.count,
    resetInMs: existing.resetAt - now,
  };
}

/** Best-effort client IP extraction from request headers. */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}
