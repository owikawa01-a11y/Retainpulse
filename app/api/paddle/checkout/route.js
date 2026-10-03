// ===========================================
//  RetainPulse - Paddle Checkout Session
//  Creates a Paddle transaction for overlay checkout
// ===========================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
const PADDLE_ENVIRONMENT = process.env.PADDLE_ENVIRONMENT || 'sandbox';
const STARTER_PRICE_ID = process.env.PADDLE_STARTER_PRICE_ID;
const PRO_PRICE_ID = process.env.PADDLE_PRO_PRICE_ID;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const PADDLE_API_BASE =
  PADDLE_ENVIRONMENT === 'sandbox'
    ? 'https://sandbox-api.paddle.com'
    : 'https://api.paddle.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const jsonResponse = (data, status = 200) =>
  Response.json(data, { status, headers: CORS_HEADERS });

const errorResponse = (message, status = 500, code = 'ERROR') =>
  jsonResponse({ success: false, error: message, code }, status);

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request) {
  const startTime = Date.now();

  try {
    if (!PADDLE_API_KEY || !STARTER_PRICE_ID || !PRO_PRICE_ID) {
      console.error('[RetainPulse][checkout] Missing Paddle env vars');
      return errorResponse('Server configuration error', 500, 'CONFIG_ERROR');
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400, 'INVALID_JSON');
    }

    const { plan } = body;

    if (!plan || !['starter', 'pro'].includes(plan)) {
      return errorResponse('Invalid plan. Use starter or pro.', 400, 'INVALID_PLAN');
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return errorResponse('Missing authorization', 401, 'NO_AUTH');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return errorResponse('Invalid session', 401, 'INVALID_SESSION');
    }

    const user = userData.user;
    const priceId = plan === 'pro' ? PRO_PRICE_ID : STARTER_PRICE_ID;

    const paddleResponse = await fetch(`${PADDLE_API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PADDLE_API_KEY}`,
      },
      body: JSON.stringify({
        items: [
          {
            price_id: priceId,
            quantity: 1,
          },
        ],
        customer: {
          email: user.email,
        },
        custom_data: {
          user_id: user.id,
          email: user.email,
          plan: plan,
        },
      }),
    });

    if (!paddleResponse.ok) {
      const errText = await paddleResponse.text();
      console.error('[RetainPulse][checkout] Paddle API error:', errText);
      return errorResponse('Paddle API error: ' + errText, 500, 'PADDLE_ERROR');
    }

    const paddleData = await paddleResponse.json();
    const transactionId = paddleData?.data?.id;

    if (!transactionId) {
      console.error('[RetainPulse][checkout] No transaction ID in response');
      return errorResponse('No transaction ID returned', 500, 'NO_TXN');
    }

    const duration = Date.now() - startTime;
    console.log(`[RetainPulse][checkout] OK | ${plan} | txn=${transactionId} | ${duration}ms`);

    return jsonResponse({
      success: true,
      transaction_id: transactionId,
    });
  } catch (err) {
    console.error('[RetainPulse][checkout] Unexpected error:', err);
    return errorResponse('Internal server error', 500, 'INTERNAL_ERROR');
  }
}