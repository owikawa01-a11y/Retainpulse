// ===========================================
//  RetainPulse API - Retention Route
//  v2: Sub-reason-aware offers
//  AI phrases the offer — never invents terms
//  All offers are realistic & executable today
// ===========================================

import { retentionRatelimit, getClientIP } from '../../../lib/ratelimit';
import { getSupabaseAdmin } from '../../../lib/serverSupabase';
import { verifyEventOwnership, UUID_REGEX } from '../../../lib/widgetAuth';
import { CORS_HEADERS, errorResponse, jsonResponse, parseJson, sanitizeText } from '../../../lib/api';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[RetainPulse][retention] Missing Supabase env vars');
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';
const GROQ_TIMEOUT_MS = 5000;

// ===========================================
//  OFFER MATRIX
//  Every offer is executable today (no billing integration needed).
//  Discounts are NOT included by default — enable per founder policy later.
// ===========================================
const REASON_OFFERS = {
  'Missing a feature I need': {
    reporting: {
      type: 'early_access',
      terms: 'early access to our new reporting engine when it ships, plus a personal update from our team'
    },
    integrations: {
      type: 'human_followup',
      terms: 'a direct line to our team — tell us which integration you need and we will follow up within 48 hours'
    },
    api: {
      type: 'early_access',
      terms: 'beta access to our API v2 today'
    },
    mobile: {
      type: 'notify',
      terms: 'a personal notification the moment our mobile app goes live'
    },
    other_feature: {
      type: 'human_followup',
      terms: 'a personal reply from our founder within 24 hours'
    }
  },
  'Switching to another tool': {
    price: {
      type: 'human_followup',
      terms: 'a 15-minute call with our founder to talk numbers honestly'
    },
    features: {
      type: 'human_followup',
      terms: 'a quick reply from our team — tell us what is missing and we will tell you if we can ship it'
    },
    ux: {
      type: 'human_followup',
      terms: 'a short call to walk through what feels off — and we will fix it'
    },
    team: {
      type: 'no_offer',
      terms: 'no offer — best of luck with the switch'
    },
    other_tool: {
      type: 'human_followup',
      terms: 'a personal reply from our founder within 24 hours'
    }
  },
  "Don't use it enough": {
    complex: {
      type: 'onboarding_call',
      terms: 'a free 15-minute setup session where we set up your account with you'
    },
    forgot: {
      type: 'value_report',
      terms: 'a monthly summary email showing exactly what you got from your subscription'
    },
    team_adoption: {
      type: 'team_onboarding',
      terms: 'a free 30-minute team onboarding session for you and your colleagues'
    },
    no_time: {
      type: 'pause_soft',
      terms: 'a soft pause — we will hold your data and you can come back whenever you are ready'
    }
  },
  'Other': {
    business_closed: {
      type: 'no_offer',
      terms: 'no offer — we wish you the best'
    },
    found_alternative: {
      type: 'data_collection',
      terms: 'a quick note from you on what made the difference — so we can learn'
    },
    exploring: {
      type: 'no_offer',
      terms: 'no offer — come back anytime'
    },
    other_unknown: {
      type: 'human_followup',
      terms: 'a personal reply from our founder within 24 hours'
    }
  }
};

const REASON_FALLBACK = {
  'Missing a feature I need': { type: 'human_followup', terms: 'a personal reply from our founder within 24 hours' },
  'Switching to another tool': { type: 'human_followup', terms: 'a quick call to understand what pulled you away' },
  "Don't use it enough": { type: 'human_followup', terms: 'a short call to see if we can help you get more out of it' },
  'Other': { type: 'human_followup', terms: 'a personal reply from our founder within 24 hours' }
};

function normalizeReason(rawReason) {
  if (!rawReason) return null;
  const r = String(rawReason).trim().toLowerCase();
  if (r.includes('feature') || r.includes('missing')) return 'Missing a feature I need';
  if (r.includes('switch') || r.includes('another') || r.includes('competitor')) return 'Switching to another tool';
  if (r.includes('use') || r.includes('enough') || r.includes('not using')) return "Don't use it enough";
  if (r === 'other' || r.includes('other')) return 'Other';
  return null;
}

function getOfferFor(reason, subReason) {
  const normalized = normalizeReason(reason);
  if (!normalized) return null;

  const matrix = REASON_OFFERS[normalized];
  if (!matrix) return null;

  if (subReason && matrix[subReason]) return matrix[subReason];
  return REASON_FALLBACK[normalized] || null;
}

function buildSystemPrompt() {
  return [
    'You are a world-class Retention Strategist.',
    'Write a warm, honest sentence that presents a retention offer to a customer who is about to cancel.',
    '',
    'CRITICAL RULES:',
    '- Reply with ONLY one sentence (ending with a period).',
    '- Present the EXACT offer terms you were given. Do not change them.',
    '- Do NOT invent additional discounts, promises, or numbers.',
    '- Do NOT use manipulative language, fake urgency, or guilt.',
    '- Be warm, human, and respectful of their decision.',
    '- Keep it under 30 words.'
  ].join('\n');
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const { success, limit, remaining, reset } = await retentionRatelimit.limit(ip);

  if (!success) {
    return jsonResponse(
      { success: false, error: 'Too many requests. Please try again in a few seconds.', code: 'RATE_LIMITED' },
      429,
      { 'X-RateLimit-Limit': String(limit), 'X-RateLimit-Remaining': String(remaining), 'X-RateLimit-Reset': String(reset) }
    );
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return errorResponse('Server configuration error', 500, 'CONFIG_ERROR');
    }

    const { body, error: parseError } = await parseJson(request);
    if (parseError) return errorResponse(parseError, 400, 'INVALID_JSON');

    const { event_id, public_key, reason, sub_reason, follow_up_answer } = body || {};
    const cleanReason = sanitizeText(reason, 500);
    const cleanSubReason = sub_reason && typeof sub_reason === 'string' ? sanitizeText(sub_reason, 100) : null;
    const cleanFollowUpAnswer = typeof follow_up_answer === 'string' ? sanitizeText(follow_up_answer, 1000) : '';

    if (!event_id || typeof event_id !== 'string' || !UUID_REGEX.test(event_id)) {
      return errorResponse('Missing or invalid event_id', 400, 'INVALID_EVENT_ID');
    }
    if (!cleanReason) return errorResponse('Missing or invalid reason', 400, 'INVALID_REASON');

    const ownership = await verifyEventOwnership(event_id, public_key);
    if (!ownership.ok) return errorResponse(ownership.message, ownership.status, ownership.code);

    const supabase = getSupabaseAdmin();

    // --- Get offer from matrix ---
    const offer = getOfferFor(cleanReason, cleanSubReason);

    if (!offer || offer.type === 'no_offer') {
      const { error: updateError } = await supabase
        .from('cancellation_events')
        .update({
          offer_shown: null,
          offer_type: 'no_offer',
          sub_reason: cleanSubReason,
          follow_up_answer: cleanFollowUpAnswer || null
        })
        .eq('id', event_id)
        .eq('widget_id', ownership.widgetId);

      if (updateError) console.error('[RetainPulse][retention] DB update error:', updateError.message);

      return jsonResponse({
        success: true,
        offer: null,
        offer_type: 'no_offer',
        message: 'No offer — proceed to cancellation'
      });
    }

    // --- Default copy ---
    let offerCopy = "We'd like to offer you " + offer.terms + '.';
    let aiSource = 'fallback';

    // --- AI phrases it ---
    if (GROQ_API_KEY) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

        const userContent =
          'A customer is about to cancel their subscription.' +
          '\nTheir reason: "' + cleanReason + '".' +
          (cleanSubReason ? '\nSpecific issue: "' + cleanSubReason + '".' : '') +
          (cleanFollowUpAnswer ? '\nAdditional context: "' + cleanFollowUpAnswer + '".' : '') +
          '\n\nWrite ONE warm, human sentence presenting this EXACT offer: "' + offer.terms + '".' +
          '\n\nRules:' +
          '\n- Do not change the offer terms.' +
          '\n- Do not add any other promise, discount, or number.' +
          '\n- Be respectful. The customer may still choose to cancel.' +
          '\n- Reply with ONLY the sentence, no quotes, no prefix.';

        const groqRes = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + GROQ_API_KEY },
          signal: controller.signal,
          body: JSON.stringify({
            model: GROQ_MODEL,
            max_tokens: 100,
            temperature: 0.5,
            messages: [{ role: 'system', content: buildSystemPrompt() }, { role: 'user', content: userContent }]
          })
        });

        clearTimeout(timeoutId);

        if (groqRes.ok) {
          const data = await groqRes.json();
          const text = data?.choices?.[0]?.message?.content?.trim();
          if (isValidOfferCopy(text, offer.terms)) {
            offerCopy = text;
            aiSource = 'groq';
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') console.warn('[RetainPulse][retention] Groq timeout');
        else console.error('[RetainPulse][retention] Groq failed:', err.message);
      }
    }

    // --- Save offer + sub_reason ---
    const { error: updateError } = await supabase
      .from('cancellation_events')
      .update({
        offer_shown: offer.terms,
        offer_type: offer.type,
        sub_reason: cleanSubReason,
        follow_up_answer: cleanFollowUpAnswer || null
      })
      .eq('id', event_id)
      .eq('widget_id', ownership.widgetId);

    if (updateError) console.error('[RetainPulse][retention] DB update error:', updateError.message);

    console.log('[RetainPulse][retention] OK | type:', offer.type, '| sub:', cleanSubReason, '| AI:', aiSource, '|', Date.now() - startTime + 'ms');

    return jsonResponse({
      success: true,
      offer: offerCopy,
      offer_type: offer.type,
      offer_terms: offer.terms
    });
  } catch (err) {
    console.error('[RetainPulse][retention] Unexpected error:', err);
    return errorResponse('Internal server error', 500, 'INTERNAL_ERROR');
  }
}

/**
 * Strict validation: AI cannot introduce any number not present in the original terms.
 */
function isValidOfferCopy(text, terms) {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  if (t.length < 10 || t.length > 320) return false;
  if (/^(offer|copy|sentence)[\s:]/i.test(t)) return false;
  if (/^["'].*["']$/.test(t)) return false;
  if (/[\r\n]/.test(t)) return false;

  const numbersInCopy = t.match(/\d+/g) || [];
  const numbersInTerms = terms.match(/\d+/g) || [];
  return numbersInCopy.every(num => numbersInTerms.includes(num));
}