import { decisionRatelimit, getClientIP } from '../../../lib/ratelimit';
import { getSupabaseAdmin } from '../../../lib/serverSupabase';
import { verifyEventOwnership, UUID_REGEX } from '../../../lib/widgetAuth';
import { CORS_HEADERS, errorResponse, jsonResponse, parseJson } from '../../../lib/api';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const rate = await decisionRatelimit.limit(ip);

  if (!rate.success) {
    return jsonResponse(
      { success: false, error: 'Too many requests. Please try again in a few seconds.', code: 'RATE_LIMITED' },
      429,
      {
        'X-RateLimit-Limit': String(rate.limit),
        'X-RateLimit-Remaining': String(rate.remaining),
        'X-RateLimit-Reset': String(rate.reset),
      }
    );
  }

  try {
    const { body, error: parseError } = await parseJson(request);
    if (parseError) return errorResponse(parseError, 400, 'INVALID_JSON');

    const { event_id, public_key, accepted, action, customer_mrr } = body || {};

    if (!event_id || typeof event_id !== 'string' || !UUID_REGEX.test(event_id)) {
      return errorResponse('Missing or invalid event_id', 400, 'INVALID_EVENT_ID');
    }

    if (typeof accepted !== 'boolean') {
      return errorResponse('accepted must be a boolean', 400, 'INVALID_ACCEPTED');
    }

    if (action != null && !['paused', 'stayed', 'cancelled'].includes(action)) {
      return errorResponse('Invalid action', 400, 'INVALID_ACTION');
    }

    const ownership = await verifyEventOwnership(event_id, public_key);
    if (!ownership.ok) return errorResponse(ownership.message, ownership.status, ownership.code);

    let finalAction = accepted ? 'stayed' : 'cancelled';
    if (action === 'paused') finalAction = 'paused';
    if (action === 'cancelled') finalAction = 'cancelled';
    if (action === 'stayed') finalAction = 'stayed';

    // MRR is analytics-only input from the merchant's widget configuration.
    // It must never be treated as authoritative billing data.
    const updatePayload = {
      offer_accepted: accepted,
      final_action: finalAction,
    };

    if (customer_mrr != null && customer_mrr !== '') {
      const mrr = Number(customer_mrr);
      if (Number.isFinite(mrr) && mrr >= 0 && mrr <= 10_000_000) {
        updatePayload.customer_mrr = mrr;
      }
    }

    const supabase = getSupabaseAdmin();
    const { data: updated, error } = await supabase
      .from('cancellation_events')
      .update(updatePayload)
      .eq('id', event_id)
      .eq('widget_id', ownership.widgetId)
      .select('id')
      .single();

    if (error || !updated) {
      console.error('[RetainPulse][decision] DB update error:', error?.message);
      return errorResponse('Could not save decision', 500, 'DB_ERROR');
    }

    console.log(`[RetainPulse][decision] ${finalAction} | ${event_id.slice(0, 8)}... | ${Date.now() - startTime}ms`);
    return jsonResponse({ success: true, event_id: updated.id, final_action: finalAction });
  } catch (error) {
    console.error('[RetainPulse][decision] Unexpected error:', error);
    return errorResponse('Internal server error', 500, 'INTERNAL_ERROR');
  }
}
