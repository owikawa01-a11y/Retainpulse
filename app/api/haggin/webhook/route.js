// app/api/haggin/webhook/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function verifySignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signatureHeader)
    );
  } catch {
    return false;
  }
}

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-haggin-signature') || req.headers.get('x-signature');
    const secret = process.env.HAGGIN_WEBHOOK_SECRET;

    // Verify signature (skip if not configured — useful for early testing)
    if (secret && signature) {
      if (!verifySignature(rawBody, signature, secret)) {
        console.warn('[Haggin Webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const eventType = body?.type;
    const data = body?.data;

    console.log('[Haggin Webhook]', eventType, JSON.stringify(data));

    switch (eventType) {
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
        console.log('[Haggin] Unknown event:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Haggin Webhook Error]', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}