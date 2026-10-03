import { getAuthenticatedUser, getSupabaseAdmin } from '../../../lib/serverSupabase';

function response(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

export async function GET(request) {
  const { user, error: authError } = await getAuthenticatedUser(request);

  if (!user) {
    return response({ success: false, error: authError || 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, email')
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      return response({ success: true, account: null, widget: null, events: [] });
    }

    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('id, public_key')
      .eq('account_id', account.id)
      .single();

    if (widgetError || !widget) {
      return response({
        success: true,
        account: { id: account.id, email: account.email },
        widget: null,
        events: [],
      });
    }

    const { data: events, error: eventsError } = await supabase
      .from('cancellation_events')
      .select('*')
      .eq('widget_id', widget.id)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (eventsError) {
      console.error('[RetainPulse][dashboard] Events query failed:', eventsError.message);
      return response({ success: false, error: 'Could not load dashboard data', code: 'DB_ERROR' }, 500);
    }

    return response({
      success: true,
      account: { id: account.id, email: account.email },
      widget: { id: widget.id, public_key: widget.public_key },
      events: events || [],
    });
  } catch (error) {
    console.error('[RetainPulse][dashboard] Unexpected error:', error);
    return response({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' }, 500);
  }
}
