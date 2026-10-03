import { answerRatelimit, getClientIP } from '../../../lib/ratelimit';
import { getSupabaseAdmin } from '../../../lib/serverSupabase';
import { verifyEventOwnership } from '../../../lib/widgetAuth';
import { CORS_HEADERS, errorResponse, jsonResponse, parseJson, sanitizeText } from '../../../lib/api';

const MAX_ANSWER_LENGTH = 1000;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const rate = await answerRatelimit.limit(ip);

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

    const { event_id, public_key, answer } = body || {};
    const ownership = await verifyEventOwnership(event_id, public_key);
    if (!ownership.ok) return errorResponse(ownership.message, ownership.status, ownership.code);

    const cleanAnswer = typeof answer === 'string' ? sanitizeText(answer, MAX_ANSWER_LENGTH) : null;
    const supabase = getSupabaseAdmin();

    const { data: updated, error } = await supabase
      .from('cancellation_events')
      .update({ follow_up_answer: cleanAnswer || null })
      .eq('id', event_id)
      .eq('widget_id', ownership.widgetId)
      .select('id')
      .single();

    if (error || !updated) {
      console.error('[RetainPulse][answer] DB update error:', error?.message);
      return errorResponse('Could not save answer', 500, 'DB_ERROR');
    }

    console.log(`[RetainPulse][answer] Saved | ${event_id.slice(0, 8)}... | ${Date.now() - startTime}ms`);
    return jsonResponse({ success: true, event_id: updated.id, has_answer: Boolean(cleanAnswer) });
  } catch (error) {
    console.error('[RetainPulse][answer] Unexpected error:', error);
    return errorResponse('Internal server error', 500, 'INTERNAL_ERROR');
  }
}
