// ===========================================
//  RetainPulse API - Account Status
//  Returns subscription status for the current user
// ===========================================

import { getAuthenticatedUser, getSupabaseAdmin } from '../../../../lib/serverSupabase';
import { getAccountAccess } from '../../../../lib/trial';


const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(request);
    if (!user) {
      return Response.json(
        { error: authError || 'Invalid session' },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: account, error: accError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (accError || !account) {
      return Response.json(
        { error: 'Account not found' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

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
