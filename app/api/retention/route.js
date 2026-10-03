// ===========================================
//  RetainPulse API - Retention Route
//  Generates ONE retention offer
//  AI only phrases the offer - never invents terms
// ===========================================

import { retentionRatelimit, getClientIP } from '../../../lib/ratelimit';
import { getSupabaseAdmin } from '../../../lib/serverSupabase';
import { verifyEventOwnership, UUID_REGEX } from '../../../lib/widgetAuth';
import { CORS_HEADERS, errorResponse, jsonResponse, parseJson, sanitizeText } from '../../../lib/api';

// --- Environment Variables ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[RetainPulse][retention] Missing Supabase env vars');
}



// --- Constants ---
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';
const GROQ_TIMEOUT_MS = 5000;

// --- Fixed Offer Terms (founder controls, AI only phrases) ---
function getOfferForReason(reason) {
  const r = String(reason).toLowerCase();

  if (/(expensive|price|cost|pay|money|budget|afford)/.test(r)) {
    return { type: 'discount', terms: '20% off for the next 3 months' };
  }
  if (/(feature|missing|need|want|lack|require)/.test(r)) {
    return {
      type: 'discount',
      terms: "15% off for 1 month, and we'll personally notify you when the feature ships",
    };
  }
  if (/(competitor|switch|another|alternative|other tool|better)/.test(r)) {
    return { type: 'discount', terms: '30% off for the next 3 months' };
  }
  if (/(use|need|time|busy|changed|not enough)/.test(r)) {
    return {
      type: 'pause',
      terms: 'a free 2-month pause instead of cancelling - resume anytime',
    };
  }
  if (/(complex|difficult|confusing|hard|complicate)/.test(r)) {
    return {
      type: 'discount',
      terms: '20% off for 2 months, and a 15-minute onboarding call with our team',
    };
  }
  return { type: 'discount', terms: '15% off for the next 2 months' };
}

// --- System Prompt (Improved) ---
function buildSystemPrompt() {
  return [
    'You are a world-class Retention Strategist.',
    'Your job is to write a warm, honest sentence that presents a retention offer to a customer who is about to cancel.',
    '',
    'CRITICAL RULES:',
    '- Reply with ONLY one sentence (ending with a period).',
    '- Present the EXACT offer terms you were given. Do not change them.',
    '- Do NOT invent any additional discounts or promises.',
    '- Do NOT use manipulative language, fake urgency, or guilt.',
    '- Be warm, human, and respectful of their decision.',
    '- Keep it under 30 words.',
    '',
    'The sentence should make the customer feel valued, not pressured.',
  ].join('\n');
}

// ===========================================
//  OPTIONS Handler
// ===========================================
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// ===========================================
//  POST Handler
// ===========================================
export async function POST(request) {
  const startTime = Date.now();

  // --- Rate Limiting ---
  const ip = getClientIP(request);
  const { success, limit, remaining, reset } = await retentionRatelimit.limit(ip);

  if (!success) {
    console.warn('[RetainPulse][retention] Rate limit hit | IP:', ip);
    return jsonResponse(
      {
        success: false,
        error: 'Too many requests. Please try again in a few seconds.',
        code: 'RATE_LIMITED',
      },
      429,
      {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(reset),
      }
    );
  }

  try {
    // --- Env Check ---
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return errorResponse('Server configuration error', 500, 'CONFIG_ERROR');
    }

    // --- Parse Body ---
    const { body, error: parseError } = await parseJson(request);
    if (parseError) return errorResponse(parseError, 400, 'INVALID_JSON');

    const { event_id, public_key, reason, follow_up_answer } = body || {};
    const cleanReason = sanitizeText(reason, 500);
    const cleanFollowUpAnswer = typeof follow_up_answer === 'string'
      ? sanitizeText(follow_up_answer, 1000)
      : '';

    // --- Validate Input ---
    if (!event_id || typeof event_id !== 'string' || !UUID_REGEX.test(event_id)) {
      return errorResponse('Missing or invalid event_id', 400, 'INVALID_EVENT_ID');
    }

    if (!cleanReason) {
      return errorResponse('Missing or invalid reason', 400, 'INVALID_REASON');
    }

    const ownership = await verifyEventOwnership(event_id, public_key);
    if (!ownership.ok) {
      return errorResponse(ownership.message, ownership.status, ownership.code);
    }

    const supabase = getSupabaseAdmin();

    // --- Get Fixed Offer ---
    const offer = getOfferForReason(cleanReason);
    let offerCopy = "We'd like to offer you " + offer.terms + '.';

    // --- AI Phrases It ---
    let aiSource = 'fallback';

    if (GROQ_API_KEY) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

        const userContent =
          'A customer is about to cancel their subscription.' +
          '\nTheir reason: "' + cleanReason + '".' +
          (cleanFollowUpAnswer ? '\nAdditional context: "' + cleanFollowUpAnswer + '".' : '') +
          '\n\nWrite ONE warm, human sentence presenting this EXACT offer: "' + offer.terms + '".' +
          '\n\nRules:' +
          '\n- Do not change the offer terms.' +
          '\n- Do not add any other promise or discount.' +
          '\n- Be respectful. The customer may still choose to cancel.' +
          '\n- Reply with ONLY the sentence, no quotes, no prefix.';

        const groqRes = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + GROQ_API_KEY,
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: GROQ_MODEL,
            max_tokens: 100,
            temperature: 0.5,
            messages: [
              { role: 'system', content: buildSystemPrompt() },
              { role: 'user', content: userContent },
            ],
          }),
        });

        clearTimeout(timeoutId);

        if (groqRes.ok) {
          const data = await groqRes.json();
          const text = data?.choices?.[0]?.message?.content?.trim();
          if (isValidOfferCopy(text, offer.terms)) {
            offerCopy = text;
            aiSource = 'groq';
          }
        } else {
          console.error('[RetainPulse][retention] Groq error | Status:', groqRes.status);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.warn('[RetainPulse][retention] Groq timeout, using default copy');
        } else {
          console.error('[RetainPulse][retention] Groq failed:', err.message);
        }
      }
    }

    // --- Save Offer Shown ---
    const { error: updateError } = await supabase
      .from('cancellation_events')
      .update({ offer_shown: offer.terms })
      .eq('id', event_id)
      .eq('widget_id', ownership.widgetId);

    if (updateError) {
      console.error('[RetainPulse][retention] DB update error:', updateError.message);
    }

    // --- Success ---
    const duration = Date.now() - startTime;
    console.log('[RetainPulse][retention] OK | type:', offer.type, '| AI:', aiSource, '|', duration + 'ms');

    return jsonResponse({
      success: true,
      offer: offerCopy,
      offer_type: offer.type,
      offer_terms: offer.terms,
    });
  } catch (err) {
    console.error('[RetainPulse][retention] Unexpected error:', err);
    return errorResponse('Internal server error', 500, 'INTERNAL_ERROR');
  }
}

// ===========================================
//  Utilities
// ===========================================

function isValidOfferCopy(text, terms) {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  if (t.length < 10 || t.length > 320) return false;
  if (/^(offer|copy|sentence)[\s:]/i.test(t)) return false;
  if (/^["'].*["']$/.test(t)) return false;
  if (/[\r\n]/.test(t)) return false;

  const lower = t.toLowerCase();
  const criticalTerms = terms.match(/\d+%|\d+\s*-?month(?:s)?|\d+\s*-?minute(?:s)?/gi) || [];
  return criticalTerms.every((term) => lower.includes(term.toLowerCase().replace(/\s+/g, ' ').trim()));
}