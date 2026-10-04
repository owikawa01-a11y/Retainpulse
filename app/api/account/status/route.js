// ===========================================
//  RetainPulse API - Account Status
//  Returns subscription status for the current user
// ===========================================

import { getAuthenticatedUser, getSupabaseAdmin } from '../../../../lib/serverSupabase';
import { getAccountAccess } from '../../../../lib/trial';

// تحديد النطاق المسموح به لـ CORS للحد من الثغرات الأمنية
const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || '*';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
  try {
    // 1. التحقق من جلسة المستخدم
    const { user, error: authError } = await getAuthenticatedUser(request);
    if (!user) {
      return Response.json(
        { error: authError || 'Invalid session' },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // 2. جلب الحقول المطلوبة فقط لرفع الأداء من Supabase
    const supabase = getSupabaseAdmin();
    const { data: account, error: accError } = await supabase
      .from('accounts')
      .select('plan_status, subscription_status, subscription_plan, trial_ends_at, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle();

    if (accError || !account) {
      return Response.json(
        { error: 'Account not found' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // 3. حساب صلاحيات الوصول
    const access = getAccountAccess(account);

    return Response.json(
      {
        success: true,
        account: {
          plan_status: account.plan_status,
          subscription_status: account.subscription_status,
          subscription_plan: account.subscription_plan,
          trial_ends_at: account.trial_ends_at,
          current_period_end: account.current_period_end,
        },
        access,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error('[RetainPulse][account-status] Error:', err);
    return Response.json(
      { error: 'Server error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
