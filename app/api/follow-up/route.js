// ===========================================
//  RetainPulse API - Follow-up Route
//  v2: Reason-specific quick-tap options
//  "Too expensive" → handled by Haggin (not here)
// ===========================================

import { followUpRatelimit, getClientIP } from '../../../lib/ratelimit';
import { sendCancellationAlert } from '../../../lib/sendEmail';
import { getSupabaseAdmin } from '../../../lib/serverSupabase';
import { CORS_HEADERS, errorResponse, jsonResponse, parseJson, sanitizeText } from '../../../lib/api';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[RetainPulse][follow-up] Missing Supabase env vars');
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';
const GROQ_TIMEOUT_MS = 5000;

// ===========================================
//  REASON CONFIG
//  Quick-tap options for each reason.
//  "Too expensive" intentionally absent → handled by Haggin
// ===========================================
const REASON_CONFIG = {
  'Missing a feature I need': {
    question: 'Which one matters most?',
    options: [
      { id: 'reporting', label: 'Reporting & analytics' },
      { id: 'integrations', label: 'Integrations' },
      { id: 'api', label: 'API access' },
      { id: 'mobile', label: 'Mobile app' },
      { id: 'other_feature', label: 'Something else' }
    ]
  },
  'Switching to another tool': {
    question: 'What pulled you away?',
    options: [
      { id: 'price', label: 'Better price' },
      { id: 'features', label: 'Better features' },
      { id: 'ux', label: 'Better UX' },
      { id: 'team', label: 'Team uses it' },
      { id: 'other_tool', label: 'Other' }
    ]
  },
  "Don't use it enough": {
    question: "What's getting in the way?",
    options: [
      { id: 'complex', label: 'Too complex to set up' },
      { id: 'forgot', label: 'Forgot about it' },
      { id: 'team_adoption', label: "Team didn't adopt it" },
      { id: 'no_time', label: 'No time to use it' }
    ]
  },
  'Other': {
    question: "What's going on?",
    options: [
      { id: 'business_closed', label: 'Business closed' },
      { id: 'found_alternative', label: 'Found an alternative' },
      { id: 'exploring', label: 'Just exploring' },
      { id: 'other_unknown', label: 'Something else' }
    ]
  }
};

// --- Reason normalizer ---
function normalizeReason(rawReason) {
  if (!rawReason) return null;
  const r = String(rawReason).trim().toLowerCase();

  if (r.includes('feature') || r.includes('missing')) return 'Missing a feature I need';
  if (r.includes('switch') || r.includes('another') || r.includes('competitor')) return 'Switching to another tool';
  if (r.includes('use') || r.includes('enough') || r.includes('not using')) return "Don't use it enough";
  if (r.includes('expensive') || r.includes('price') || r.includes('cost')) return 'Too expensive';
  if (r === 'other' || r.includes('other')) return 'Other';

  return null;
}

function buildSystemPrompt() {
  return [
    'You are an expert Retention Strategist.',
    "Uncover the deeper need behind a customer's surface reason.",
    '',
    'RULES:',
    '- Reply with ONLY one question (under 20 words).',
    '- Be empathetic, specific, non-judgmental.',
    '- Never invent offers or use guilt.'
  ].join('\n');
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request) {
  const startTime = Date.now();

  const ip = getClientIP(request);
  const { success, limit, remaining, reset } = await followUpRatelimit.limit(ip);

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

    const { public_key, reason, customer_email } = body;
    if (!public_key || typeof public_key !== 'string') return errorResponse('Missing or invalid public_key', 400, 'INVALID_KEY');
    if (!reason || typeof reason !== 'string' || reason.trim().length < 2) return errorResponse('Missing or invalid reason', 400, 'INVALID_REASON');

    const cleanReason = sanitizeText(reason, 500);
    const cleanPublicKey = public_key.trim().slice(0, 100);
    const cleanEmail = customer_email && typeof customer_email === 'string'
      ? sanitizeText(customer_email, 200).toLowerCase()
      : null;

    const supabase = getSupabaseAdmin();

    // --- Find widget ---
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('id, account_id')
      .eq('public_key', cleanPublicKey)
      .single();

    if (widgetError || !widget) {
      return errorResponse('Invalid widget key', 404, 'WIDGET_NOT_FOUND');
    }

    // --- Decide: quick-tap or AI fallback ---
    const normalizedReason = normalizeReason(cleanReason);
    const reasonConfig = normalizedReason ? REASON_CONFIG[normalizedReason] : null;

    let followUpPayload;
    let mode;

    if (reasonConfig) {
      followUpPayload = {
        question: reasonConfig.question,
        options: reasonConfig.options
      };
      mode = 'quick_tap';
    } else {
      // AI fallback for unmapped reasons
      let aiQuestion = getFallbackQuestion(cleanReason);
      mode = 'fallback';

      if (GROQ_API_KEY) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

          const userContent = 'Customer is cancelling. Reason: "' + cleanReason + '".\n\nWrite ONE empathetic follow-up question (under 20 words) that uncovers the real need.\nReply with ONLY the question.';

          const groqRes = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + GROQ_API_KEY },
            signal: controller.signal,
            body: JSON.stringify({
              model: GROQ_MODEL,
              max_tokens: 50,
              temperature: 0.6,
              messages: [{ role: 'system', content: buildSystemPrompt() }, { role: 'user', content: userContent }]
            })
          });

          clearTimeout(timeoutId);

          if (groqRes.ok) {
            const data = await groqRes.json();
            const text = data?.choices?.[0]?.message?.content?.trim();
            if (isValidQuestion(text)) { aiQuestion = text; mode = 'groq'; }
          }
        } catch (err) {
          if (err.name === 'AbortError') console.warn('[RetainPulse][follow-up] Groq timeout');
          else console.error('[RetainPulse][follow-up] Groq failed:', err.message);
        }
      }

      followUpPayload = { question: aiQuestion, options: null };
    }

    // --- Save event ---
    const { data: event, error: insertError } = await supabase
      .from('cancellation_events')
      .insert({
        widget_id: widget.id,
        customer_email: cleanEmail,
        initial_reason: cleanReason,
        ai_follow_up_question: followUpPayload.question
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[RetainPulse][follow-up] DB insert error:', insertError.message);
      return errorResponse('Could not save event', 500, 'DB_ERROR');
    }

    // --- Email notification ---
    if (cleanEmail) {
      try {
        const { data: account } = await supabase.from('accounts').select('email').eq('id', widget.account_id).single();
        if (account?.email) {
          await sendCancellationAlert({
            toEmail: account.email,
            customerEmail: cleanEmail,
            reason: cleanReason,
            aiQuestion: followUpPayload.question,
            followUpAnswer: null,
            offerShown: null
          });
        }
      } catch (err) {
        console.error('[RetainPulse][follow-up] Email failed:', err.message);
      }
    }

    const duration = Date.now() - startTime;
    console.log('[RetainPulse][follow-up] OK | mode:', mode, '|', duration + 'ms');

    return jsonResponse({
      success: true,
      event_id: event.id,
      follow_up: followUpPayload,
      question: followUpPayload.question, // backward compat
      mode
    });
  } catch (err) {
    console.error('[RetainPulse][follow-up] Unexpected error:', err);
    return errorResponse('Internal server error', 500, 'INTERNAL_ERROR');
  }
}

function isValidQuestion(text) {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  if (t.length < 5 || t.length > 200) return false;
  if (/^(question|q)[\s:]/i.test(t)) return false;
  if (/^["'].*["']$/.test(t)) return false;
  return true;
}

function getFallbackQuestion(reason) {
  const r = String(reason).toLowerCase();
  if (/(expensive|price|cost|pay|money|budget|afford)/.test(r)) return 'What price would have felt fair for the value you received?';
  if (/(feature|missing|need|want|lack|require)/.test(r)) return 'What specific feature would have made this a must-have for you?';
  if (/(competitor|switch|another|alternative|other tool|better)/.test(r)) return 'What is the other tool doing better that we missed?';
  if (/(use|need|time|busy|changed|not enough)/.test(r)) return 'What changed about your needs that made this less useful?';
  return 'What could we have done differently to keep you with us?';
}