// lib/haggin.js
// Haggin API integration for RetainPulse
// Docs: https://hagg.in/docs/api

const HAGGIN_API_URL = 'https://hagg.in/api/v1';

function getKey() {
  const key = process.env.HAGGIN_API_KEY;
  if (!key) throw new Error('HAGGIN_API_KEY is not set in .env.local');
  return key;
}

async function hagginFetch(path, options = {}) {
  const res = await fetch(`${HAGGIN_API_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${getKey()}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('[Haggin API Error]', path, data);
    throw new Error(data?.error?.message || `Haggin API error: ${res.status}`);
  }

  return data;
}

/**
 * Create a private Haggin for one specific customer.
 * Returns { id, public_url, status } etc.
 */
export async function createHaggin({ customerName, customerEmail, productName = 'RetainPulse Pro', priceCents = 2900 }) {
  return hagginFetch('/selling/haggins', {
    method: 'POST',
    headers: {
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify({
      title: `RetainPulse — ${customerName}`,
      kind: 'private',
      invited_name: customerName,
      invited_email: customerEmail,
      products: [
        {
          name: productName,
          standard_price_cents: priceCents,
          currency: 'USD',
          billing_period: 'month',
          pricing_model: 'flat',
        },
      ],
      options: [
        { type: 'licenses', enabled: true },
        { type: 'annual_commitment', enabled: true },
        { type: 'testimonial', enabled: true },
      ],
      allow_custom_offers: true,
      duration_days: 7,
      on_expiry: 'close',
    }),
  });
}

/**
 * Publish a draft Haggin. Returns live Haggin with public_url.
 */
export async function publishHaggin(hagginId) {
  return hagginFetch(`/selling/haggins/${hagginId}/publish`, {
    method: 'POST',
    headers: {
      'Idempotency-Key': crypto.randomUUID(),
    },
  });
}

/**
 * Convenience: create + publish in one call.
 */
export async function createAndPublishHaggin(customer) {
  const draft = await createHaggin(customer);
  const hagginId = draft.data.id;
  const live = await publishHaggin(hagginId);
  return live.data;
}

/**
 * Get negotiations waiting on the seller (founder).
 */
export async function getNegotiations(view = 'attention') {
  return hagginFetch(`/selling/negotiations?view=${view}`);
}

/**
 * Get one negotiation with all offers.
 */
export async function getNegotiation(id) {
  return hagginFetch(`/selling/negotiations/${id}`);
}

/**
 * Accept the current offer on a negotiation.
 */
export async function acceptOffer(id) {
  return hagginFetch(`/selling/negotiations/${id}/accept`, {
    method: 'POST',
    headers: {
      'Idempotency-Key': crypto.randomUUID(),
    },
  });
}

/**
 * Reject the current offer.
 */
export async function rejectOffer(id, reason = 'too_low') {
  return hagginFetch(`/selling/negotiations/${id}/reject`, {
    method: 'POST',
    headers: {
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify({ reason }),
  });
}