// app/api/haggin/webhook/route.js
// Haggin webhook receiver for RetainPulse
// Docs: https://hagg.in/docs/api

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ─────────────────────────────────────────────
//  Config
// ─────────────────────────────────────────────
const MAX_BODY_BYTES = 100 * 1024; // 100 KB (Haggin limit)
const TOLERANCE_SECONDS = 5 * 60;   // Reject signatures older than 5 min

// Try these headers in order (Haggin may use any of them)
const SIGNATURE_HEADERS = [
  'x-haggin-signature',
  'x-webhook-signature',
  'x-signature',
  'haggin-signature',
];

// ─────────────────────────────────────────────
//  Signature verification
//  Supports:
//    - Plain HMAC: "hexstring"
//    - Stripe-style: "t=timestamp,v1=signature"
// ─────────────────────────────────────────────
function extractSignature(rawHeader) {
  if (!rawHeader) return null;

  // Stripe-style: t=...,v1=...
  if (rawHeader.includes('t=') && rawHeader.includes('v1=')) {
    const parts = rawHeader.split(',');
    const map = {};
    for (const part of parts) {
      const [k, v] = part.split('=');
      if (k && v) map[k.trim()] = v.trim();
    }
    if (map.v1) {
      return { scheme: 'stripe', timestamp: map.t || null, signature: map.v1 };
    }
  }

  // Plain hex
  const hex = rawHeader.trim();
  if (/^[0-9a-f]+$/i.test(hex)) {
    return { scheme: 'plain', timestamp: null, signature: hex };
  }

  return null;
}

function timingSafeEqualHex(a, b) {
  try {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function verifySignature(rawBody, parsed, secret) {
  if (!parsed || !secret) return false;

  const { scheme, timestamp, signature } = parsed;

  // Reject stale signatures
  if (timestamp) {
    const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
    if (isNaN(age) || age > TOLERANCE_SECONDS) {
      return false;
    }
  }

  // Compute expected signatures
  const payloads = timestamp
    ? [`${timestamp}.${rawBody}`, rawBody]
    : [rawBody];

  for (const payload of payloads) {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    if (timingSafeEqualHex(expected, signature)) {
      return true;
    }
  }

  return false;
}

// ─────────────────────────────────────────────
//  Event handlers
// ─────────────────────────────────────────────
function handleEvent(eventType, data) {
  const meta = {
    event: eventType,
    at: new Date().toISOString(),
  };

  switch (eventType) {
    case 'ping':
      console.log('[Haggin] ping received', meta);
      return;

    case 'haggin.published':
      console.log('[Haggin] Haggin published', {
        ...meta,
        hagginId: data?.haggin?.id,
        publicUrl: data?.haggin?.public_url,
      });
      return;

    case 'haggin.closed':
      console.log('[Haggin] Haggin closed', {
        ...meta,
        hagginId: data?.haggin?.id,
      });
      return;

    case 'offer.received':
      console.log('[Haggin] Offer received', {
        ...meta,
        negotiationId: data?.negotiation?.id,
        amountCents: data?.offer?.amount_cents,
        ratio: data?.interpretation?.ratio,
      });
      // TODO: notify founder (email / dashboard badge)
      return;

    case 'offer.countered':
      console.log('[Haggin] Offer countered', {
        ...meta,
        negotiationId: data?.negotiation?.id,
      });
      return;

    case 'offer.accepted':
    case 'deal.won':
      console.log('[Haggin] Deal won 🎉', {
        ...meta,
        dealId: data?.deal?.id,
        negotiationId: data?.negotiation?.id,
        amountCents: data?.offer?.amount_cents,
      });
      // TODO: update customer status to 'retained' in Supabase
      return;

    case 'offer.rejected':
      console.log('[Haggin] Offer rejected', {
        ...meta,
        negotiationId: data?.negotiation?.id,
      });
      return;

    case 'negotiation.closed':
      console.log('[Haggin] Negotiation closed', {
        ...meta,
        negotiationId: data?.negotiation?.id,
        reason: data?.close_reason,
      });
      return;

    case 'deal.payment_ready':
      console.log('[Haggin] Payment ready', {
        ...meta,
        dealId: data?.deal?.id,
        paymentUrl: data?.deal?.payment_link_url,
      });
      return;

    case 'deal.paid':
      console.log('[Haggin] Payment landed 💰', {
        ...meta,
        dealId: data?.deal?.id,
        amountCents: data?.offer?.amount_cents,
        currency: data?.offer?.currency,
      });
      // TODO: record MRR in Supabase
      return;

    default:
      console.log('[Haggin] Unknown event', { ...meta, data });
  }
}

// ─────────────────────────────────────────────
//  Route handler
// ─────────────────────────────────────────────
export async function POST(req) {
  const startTime = Date.now();

  try {
    // 1. Size guard
    const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
    if (contentLength > MAX_BODY_BYTES) {
      console.warn('[Haggin Webhook] Body too large', { contentLength });
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413 }
      );
    }

    // 2. Read raw body (needed for signature)
    const rawBody = await req.text();
    if (!rawBody || rawBody.length === 0) {
      return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    }

    // 3. Parse JSON
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      console.warn('[Haggin Webhook] Invalid JSON');
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // 4. Signature verification
    const secret = process.env.HAGGIN_WEBHOOK_SECRET;
    const sigHeader = SIGNATURE_HEADERS
      .map((h) => req.headers.get(h))
      .find((v) => v);

    if (secret) {
      const parsed = extractSignature(sigHeader);

      if (!parsed) {
        console.warn('[Haggin Webhook] Missing or malformed signature', {
          headers: Object.fromEntries(req.headers.entries()),
        });
        return NextResponse.json(
          { error: 'Missing signature' },
          { status: 401 }
        );
      }

      const valid = verifySignature(rawBody, parsed, secret);
      if (!valid) {
        console.warn('[Haggin Webhook] Invalid signature', {
          scheme: parsed.scheme,
        });
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } else {
      console.warn('[Haggin Webhook] No secret configured — skipping verification');
    }

    // 5. Route by event type
    const eventType = body?.type || body?.event || 'unknown';
    const data = body?.data || {};

    handleEvent(eventType, data);

    // 6. Respond fast
    const duration = Date.now() - startTime;
    console.log(`[Haggin Webhook] Handled ${eventType} in ${duration}ms`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Haggin Webhook] Unhandled error', {
      message: error.message,
      stack: error.stack,
    });
    // Return 200 to avoid Haggin retries on our bugs — we'll investigate via logs
    return NextResponse.json({ received: true, error: 'internal' });
  }
}

// Health check (optional)
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: 'haggin-webhook',
    hasSecret: !!process.env.HAGGIN_WEBHOOK_SECRET,
  });
}