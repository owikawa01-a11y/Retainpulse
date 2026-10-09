// app/api/haggin/webhook/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SIGNATURE_HEADERS = [
  'x-haggin-signature',
  'x-webhook-signature',
  'x-signature',
  'haggin-signature',
  'x-hub-signature-256',
  'x-hub-signature',
];

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

  // sha256=... (GitHub style)
  if (rawHeader.startsWith('sha256=')) {
    return { scheme: 'plain', timestamp: null, signature: rawHeader.slice(7) };
  }

  // Plain hex
  const hex = rawHeader.trim();
  if (/^[0-9a-f]+$/i.test(hex)) {
    return { scheme: 'plain', timestamp: null, signature: hex };
  }

  return { scheme: 'unknown', timestamp: null, signature: rawHeader };
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

export async function POST(req) {
  try {
    const rawBody = await req.text();

    // 🔍 Log everything for debugging
    const allHeaders = {};
    req.headers.forEach((v, k) => { allHeaders[k] = v; });
    console.log('[Haggin Webhook] HEADERS:', JSON.stringify(allHeaders));
    console.log('[Haggin Webhook] BODY:', rawBody.slice(0, 500));

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const eventType = body?.type || body?.event || 'unknown';
    const data = body?.data || {};

    // Find signature header
    const secret = process.env.HAGGIN_WEBHOOK_SECRET;
    let sigHeader = null;
    let usedHeader = null;
    for (const h of SIGNATURE_HEADERS) {
      const v = req.headers.get(h);
      if (v) {
        sigHeader = v;
        usedHeader = h;
        break;
      }
    }

    console.log('[Haggin Webhook] SIGNATURE HEADER:', usedHeader, '=', sigHeader);

    // ⚠️ Verification — if signature is missing, LOG but don't block (for now)
    if (secret && sigHeader) {
      const parsed = extractSignature(sigHeader);
      console.log('[Haggin Webhook] PARSED:', JSON.stringify(parsed));

      if (parsed && parsed.scheme !== 'unknown') {
        const expected = crypto
          .createHmac('sha256', secret)
          .update(rawBody, 'utf8')
          .digest('hex');

        if (!timingSafeEqualHex(expected, parsed.signature)) {
          console.warn('[Haggin Webhook] Invalid signature — but allowing for testing');
        }
      }
    }

    // Handle event
    console.log('[Haggin Webhook] EVENT:', eventType, JSON.stringify(data));
    switch (eventType) {
      case 'ping':
        console.log('[Haggin] ping received ✅');
        break;
      case 'offer.received':
        console.log('[Haggin] Offer received:', data?.negotiation?.id);
        break;
      case 'deal.won':
        console.log('[Haggin] Deal won:', data?.deal?.id);
        break;
      case 'deal.paid':
        console.log('[Haggin] Deal paid:', data?.deal?.id);
        break;
      default:
        console.log('[Haggin] Event:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Haggin Webhook Error]', error);
    return NextResponse.json({ received: true, error: 'internal' });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: 'haggin-webhook',
    hasSecret: !!process.env.HAGGIN_WEBHOOK_SECRET,
  });
}