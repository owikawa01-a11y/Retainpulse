// ===========================================
//  RetainPulse - Paddle Webhook Handler
//  Receives and verifies Paddle subscription events
// ===========================================

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Verify Paddle webhook signature ---
function verifySignature(rawBody, signatureHeader) {
  if (!signatureHeader || !WEBHOOK_SECRET) {
    console.error('[RetainPulse][paddle] Missing signature or secret');
    return false;
  }

  try {
    // Paddle sends: ts=timestamp;h1=hash
    const parts = signatureHeader.split(';').reduce((acc, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {});

    const ts = parts.ts;
    const h1 = parts.h1;

    if (!ts || !h1) {
      console.error('[RetainPulse][paddle] Invalid signature format');
      return false;
    }

    const signedPayload = `${ts}:${rawBody}`;
    const expected = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(signedPayload)
      .digest('hex');

    // Constant-time comparison
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(h1)
    );
  } catch (err) {
    console.error('[RetainPulse][paddle] Signature verification error:', err.message);
    return false;
  }
}

// --- Extract price ID from event data ---
function extractPriceId(data) {
  if (data.items && data.items.length > 0) {
    return data.items[0].price?.id || data.items[0].price_id;
  }
  return data.price_id || null;
}

// --- Determine plan from price ID ---
function getPlanFromPriceId(priceId) {
  if (!priceId) return 'starter';

  if (priceId === process.env.PADDLE_PRO_PRICE_ID) {
    return 'pro';
  }
  if (priceId === process.env.PADDLE_STARTER_PRICE_ID) {
    return 'starter';
  }
  return 'starter';
}

// ===========================================
//  POST Handler
// ===========================================
export async function POST(request) {
  const startTime = Date.now();

  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('paddle-signature');

    // Verify signature
    if (!verifySignature(rawBody, signature)) {
      console.error('[RetainPulse][paddle] Invalid signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse event
    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const eventType = event.event_type;
    const data = event.data;

    console.log(`[RetainPulse][paddle] Event: ${eventType}`);

    // --- Handle subscription events ---
    const email = data?.customer?.email || data?.custom_data?.email;
    const subscriptionId = data?.id;
    const customerId = data?.customer_id;
    const priceId = extractPriceId(data);
    const plan = getPlanFromPriceId(priceId);

    const subscriptionEvents = [
      'subscription.created',
      'subscription.activated',
      'subscription.trialing',
      'subscription.updated',
      'subscription.resumed',
    ];

    const cancelEvents = [
      'subscription.canceled',
      'subscription.paused',
    ];

    // --- Subscription Active ---
    if (subscriptionEvents.includes(eventType) && email) {
      const status = eventType === 'subscription.trialing' ? 'trialing' : 'active';
      const trialEndsAt = data?.current_billing_period?.ends_at || null;
      const periodEnd = data?.next_billed_at || null;

      const { error } = await supabase
        .from('accounts')
        .update({
          paddle_subscription_id: subscriptionId,
          paddle_customer_id: customerId,
          subscription_status: status,
          subscription_plan: plan,
          plan_status: plan,
          trial_ends_at: status === 'trialing' ? trialEndsAt : null,
          current_period_end: periodEnd,
        })
        .eq('email', email);

      if (error) {
        console.error('[RetainPulse][paddle] DB update error:', error.message);
      } else {
        console.log(`[RetainPulse][paddle] Activated ${plan} for ${email}`);
      }
    }

    // --- Subscription Canceled / Paused ---
    if (cancelEvents.includes(eventType) && subscriptionId) {
      const { error } = await supabase
        .from('accounts')
        .update({
          subscription_status: eventType === 'subscription.paused' ? 'paused' : 'canceled',
          plan_status: 'trial',
        })
        .eq('paddle_subscription_id', subscriptionId);

      if (error) {
        console.error('[RetainPulse][paddle] DB update error:', error.message);
      } else {
        console.log(`[RetainPulse][paddle] ${eventType} for ${subscriptionId}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[RetainPulse][paddle] OK | ${eventType} | ${duration}ms`);

    return Response.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('[RetainPulse][paddle] Unexpected error:', err);
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}