// In-memory per-IP rate limiter.
//
// Lambda execution context is reused across invocations within the same
// container, so this Map persists for the container's lifetime — usually
// minutes to hours of warm-pool reuse. New container = fresh Map.
//
// Caveat: under high concurrency, AWS spins up multiple containers and
// each has its own Map, so a determined attacker hitting many parallel
// invocations can leak past this limit. For tight cross-instance limits,
// store buckets in DynamoDB (atomic UpdateItem with conditional ADD).

const buckets = new Map();
const MAX_BUCKETS = 10_000;

export function rateLimit(key, options = {}) {
  const limit = options.limit ?? 3;
  const windowMs = options.windowMs ?? 60 * 60 * 1000;
  const now = Date.now();

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
