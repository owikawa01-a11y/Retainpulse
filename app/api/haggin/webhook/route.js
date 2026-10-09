// app/api/haggin/webhook/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const eventType = body?.type;
    const data = body?.data;

    console.log('[Haggin Webhook]', eventType, JSON.stringify(data));

    // TODO: save to Supabase / update dashboard
    switch (eventType) {
      case 'offer.received':
        // Customer made an offer — notify founder
        console.log('[Haggin] Offer received:', data?.negotiation?.id);
        break;
      case 'deal.won':
        // Deal agreed — customer is staying
        console.log('[Haggin] Deal won:', data?.deal?.id);
        break;
      case 'deal.paid':
        // Payment landed — record MRR
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