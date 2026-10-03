// ===========================================
//  RetainPulse - Rate Limiting Configuration
//  Uses Upstash Redis with graceful fail-open
// ===========================================

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// --- Redis Client (graceful fallback) ---
let redis = null;
let redisAvailable = false;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    redisAvailable = true;
    console.log('[RetainPulse][ratelimit] Redis initialized');
  } else {
    console.warn('[RetainPulse][ratelimit] Upstash env vars missing - rate limiting disabled');
  }
} catch (err) {
  console.error('[RetainPulse][ratelimit] Redis init failed:', err.message);
}

// --- Safe Rate Limiter Factory ---
// Fails open (allows request) if Redis is down.
function createSafeRatelimit(prefix, tokens, window) {
  if (!redisAvailable) {
    return {
      limit: async () => ({ success: true, limit: 0, remaining: 0, reset: 0 }),
    };
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: true,
    prefix: prefix,
  });

  return {
    limit: async (identifier) => {
      try {
        return await limiter.limit(identifier);
      } catch (err) {
        console.error('[RetainPulse][ratelimit] Limit check failed:', err.message);
        return { success: true, limit: 0, remaining: 0, reset: 0 };
      }
    },
  };
}

// --- Rate Limiters ---
export const followUpRatelimit = createSafeRatelimit('rp:followup', 5, '10 s');
export const answerRatelimit = createSafeRatelimit('rp:answer', 10, '10 s');
export const retentionRatelimit = createSafeRatelimit('rp:retention', 5, '10 s');
export const decisionRatelimit = createSafeRatelimit('rp:decision', 10, '10 s');
export const leadRatelimit = createSafeRatelimit('rp:lead', 3, '60 s');

// --- Get Client IP ---
export function getClientIP(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous'
  );
}