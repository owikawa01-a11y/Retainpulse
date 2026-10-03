// ===========================================
// RetainPulse API - Lead Intake
// ===========================================

import {
  sendLeadNotificationToOwner,
  sendLeadConfirmationToCustomer,
} from '../../../lib/sendLeadEmail';
import { leadRatelimit, getClientIP } from '../../../lib/ratelimit';
import { getSupabaseAdmin } from '../../../lib/serverSupabase';
import {
  errorResponse,
  isValidEmail,
  normalizeHttpUrl,
  parseJson,
  sanitizeText,
} from '../../../lib/api';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ALLOWED_MRR = new Set(['<$1K', '$1K-$5K', '$5K-$20K', '$20K+']);

export async function POST(request) {
  const startTime = Date.now();
  const rate = await leadRatelimit.limit(getClientIP(request));

  if (!rate.success) {
    return errorResponse(
      'Too many requests. Please try again in a minute.',
      429,
      'RATE_LIMITED',
      {
        'Retry-After': '60',
        'X-RateLimit-Limit': String(rate.limit),
        'X-RateLimit-Remaining': String(rate.remaining),
        'X-RateLimit-Reset': String(rate.reset),
      }
    );
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return errorResponse('Server configuration error', 500, 'CONFIG_ERROR');
    }

    const { body, error: parseError } = await parseJson(request);
    if (parseError) return errorResponse(parseError, 400, 'INVALID_JSON');

    const { name, email, saas_url, mrr_range, churn_problem } = body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return errorResponse('Please enter your name', 400, 'INVALID_NAME');
    }

    if (!isValidEmail(email)) {
      return errorResponse('Please enter a valid email', 400, 'INVALID_EMAIL');
    }

    const cleanUrl = normalizeHttpUrl(saas_url);
    if (!cleanUrl) {
      return errorResponse('Please enter a valid SaaS URL', 400, 'INVALID_URL');
    }

    if (!ALLOWED_MRR.has(mrr_range)) {
      return errorResponse('Please select your MRR range', 400, 'INVALID_MRR');
    }

    const cleanName = sanitizeText(name, 100);
    const cleanEmail = email.trim().toLowerCase().slice(0, 200);
    const cleanMrr = sanitizeText(mrr_range, 50);
    const cleanProblem = churn_problem ? sanitizeText(churn_problem, 2000) : null;

    if (cleanName.length < 2) {
      return errorResponse('Please enter your name', 400, 'INVALID_NAME');
    }

    const supabase = getSupabaseAdmin();
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert({
        name: cleanName,
        email: cleanEmail,
        saas_url: cleanUrl,
        mrr_range: cleanMrr,
        churn_problem: cleanProblem,
        status: 'new',
        source: 'book_page',
      })
      .select('id')
      .single();

    if (insertError || !lead) {
      console.error('[RetainPulse][leads] DB insert error:', insertError?.message);
      return errorResponse('Could not save your request', 500, 'DB_ERROR');
    }

    const [ownerResult, customerResult] = await Promise.all([
      sendLeadNotificationToOwner({
        name: cleanName,
        email: cleanEmail,
        saasUrl: cleanUrl,
        mrrRange: cleanMrr,
        churnProblem: cleanProblem,
      }).catch((error) => {
        console.error('[RetainPulse][leads] Owner email failed:', error.message);
        return { success: false };
      }),
      sendLeadConfirmationToCustomer({
        name: cleanName,
        email: cleanEmail,
      }).catch((error) => {
        console.error('[RetainPulse][leads] Customer email failed:', error.message);
        return { success: false };
      }),
    ]);

    console.log(
      `[RetainPulse][leads] Created | id=${lead.id.slice(0, 8)} | owner=${ownerResult.success} | customer=${customerResult.success} | ${Date.now() - startTime}ms`
    );

    return Response.json({
      success: true,
      lead_id: lead.id,
    });
  } catch (error) {
    console.error('[RetainPulse][leads] Unexpected error:', error);
    return errorResponse('Internal server error', 500, 'INTERNAL_ERROR');
  }
}
