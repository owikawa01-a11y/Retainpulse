// ===========================================
//  RetainPulse API - Follow-up Route
//  Generates AI follow-up question + sends email notification
// ===========================================

import { followUpRatelimit, getClientIP } from '../../../lib/ratelimit';
import { sendCancellationAlert } from '../../../lib/sendEmail';
import { getSupabaseAdmin } from '../../../lib/serverSupabase';
import { CORS_HEADERS, errorResponse, jsonResponse, parseJson, sanitizeText } from '../../../lib/api';

// --- Environment Variables ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[RetainPulse][follow-up] Missing Supabase env vars');
}



// --- Constants ---
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';
const GROQ_TIMEOUT_MS = 5000;

// --- System Prompt ---
function buildSystemPrompt() {
  return [
    'You are an expert Retention Strategist.',
    'Uncover the deeper need behind a customer\'s surface reason.',
    '',
    'RULES:',
    '- Reply with ONLY one question (under 20 words).',
    '- Be empathetic, specific, non-judgmental.',
    '- Never invent offers or use guilt.',
    '',
    'Example: "Too expensive" -> "What price would have felt fair?"',
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
  const { success, limit, remaining, reset } = await followUpRatelimit.limit(ip);

  if (!success) {
    console.warn('[RetainPulse][follow-up] Rate limit hit | IP:', ip);
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

    const { public_key, reason, customer_email } = body;

    // --- Validate Input ---
    if (!public_key || typeof public_key !== 'string') {
      return errorResponse('Missing or invalid public_key', 400, 'INVALID_KEY');
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length < 2) {
      return errorResponse('Missing or invalid reason', 400, 'INVALID_REASON');
    }

    // --- Sanitize ---
    const cleanReason = sanitizeText(reason, 500);
    const cleanPublicKey = public_key.trim().slice(0, 100);
    const cleanEmail = customer_email && typeof customer_email === 'string'
      ? sanitizeText(customer_email, 200).toLowerCase()
      : null;

    const supabase = getSupabaseAdmin();

    // --- Find Widget ---
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('id, account_id')
      .eq('public_key', cleanPublicKey)
      .single();

    if (widgetError || !widget) {
      console.warn('[RetainPulse][follow-up] Widget not found | Key:', cleanPublicKey.slice(0, 8) + '...');
      return errorResponse('Invalid widget key', 404, 'WIDGET_NOT_FOUND');
    }

    // --- Get Account Owner Email ---
    let ownerEmail = null;
    try {
      const { data: account } = await supabase
        .from('accounts')
        .select('email')
        .eq('id', widget.account_id)
        .single();
      if (account?.email) ownerEmail = account.email;
    } catch (err) {
      console.error('[RetainPulse][follow-up] Failed to fetch account email:', err.message);
    }

    // --- Generate AI Question ---
    let followUpQuestion = getFallbackQuestion(cleanReason);
    let aiSource = 'fallback';

    if (GROQ_API_KEY) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

        const userContent =
          'Customer is cancelling. Reason: "' + cleanReason + '".' +
          '\n\nWrite ONE empathetic follow-up question (under 20 words) that uncovers the real need.' +
          '\nReply with ONLY the question.';

        const groqRes = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + GROQ_API_KEY,
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: GROQ_MODEL,
            max_tokens: 50,
            temperature: 0.6,
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
          if (isValidQuestion(text)) {
            followUpQuestion = text;
            aiSource = 'groq';
          }
        } else {
          console.error('[RetainPulse][follow-up] Groq error | Status:', groqRes.status);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.warn('[RetainPulse][follow-up] Groq timeout, using fallback');
        } else {
          console.error('[RetainPulse][follow-up] Groq failed:', err.message);
        }
      }
    }

    // --- Save Event ---
    const { data: event, error: insertError } = await supabase
      .from('cancellation_events')
      .insert({
        widget_id: widget.id,
        customer_email: cleanEmail,
        initial_reason: cleanReason,
        ai_follow_up_question: followUpQuestion,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[RetainPulse][follow-up] DB insert error:', insertError.message);
      return errorResponse('Could not save event', 500, 'DB_ERROR');
    }

    // --- Send Email Notification (MUST await for Vercel!) ---
    let emailSent = false;
    if (ownerEmail) {
      try {
        console.log('[RetainPulse][follow-up] Sending email to:', ownerEmail);
        const emailResult = await sendCancellationAlert({
          toEmail: ownerEmail,
          customerEmail: cleanEmail,
          reason: cleanReason,
          aiQuestion: followUpQuestion,
          followUpAnswer: null,
          offerShown: null,
        });
        emailSent = emailResult.success;
        console.log('[RetainPulse][follow-up] Email result:', emailResult);
      } catch (err) {
        console.error('[RetainPulse][follow-up] Email failed:', err.message);
      }
    } else {
      console.warn('[RetainPulse][follow-up] No owner email, skipping notification');
    }

    // --- Success ---
    const duration = Date.now() - startTime;
    console.log(
      '[RetainPulse][follow-up] OK | AI:', aiSource,
      '| Email:', emailSent ? 'sent' : 'failed/skipped',
      '|', duration + 'ms'
    );

    return jsonResponse({
      success: true,
      event_id: event.id,
      question: followUpQuestion,
      source: aiSource,
      email_sent: emailSent,
    });
  } catch (err) {
    console.error('[RetainPulse][follow-up] Unexpected error:', err);
    return errorResponse('Internal server error', 500, 'INTERNAL_ERROR');
  }
}

// ===========================================
//  Utilities
// ===========================================

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
  if (/(expensive|price|cost|pay|money|budget|afford)/.test(r)) {
    return 'What price would have felt fair for the value you received?';
  }
  if (/(feature|missing|need|want|lack|require)/.test(r)) {
    return 'What specific feature would have made this a must-have for you?';
  }
  if (/(competitor|switch|another|alternative|other tool|better)/.test(r)) {
    return 'What is the other tool doing better that we missed?';
  }
  if (/(use|need|time|busy|changed|not enough)/.test(r)) {
    return 'What changed about your needs that made this less useful?';
  }
  if (/(bug|error|broken|slow|crash|issue|problem)/.test(r)) {
    return 'What specific issue did you experience that we should fix?';
  }
  if (/(support|help|service|response|contact)/.test(r)) {
    return 'How could our support have helped you better?';
  }
  if (/(complex|difficult|confusing|hard|complicate)/.test(r)) {
    return 'Which part of the product felt most complicated to use?';
  }
  return 'What could we have done differently to keep you with us?';
}