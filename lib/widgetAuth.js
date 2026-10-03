import { getSupabaseAdmin } from './serverSupabase';

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A public widget key identifies a widget; it is not a secret.
 * The event ownership check prevents one public widget from modifying
 * another widget's cancellation event.
 */
export async function verifyEventOwnership(eventId, publicKey) {
  if (!eventId || typeof eventId !== 'string' || !UUID_REGEX.test(eventId)) {
    return {
      ok: false,
      status: 400,
      code: 'INVALID_EVENT_ID',
      message: 'Missing or invalid event_id',
    };
  }

  if (!publicKey || typeof publicKey !== 'string') {
    return {
      ok: false,
      status: 400,
      code: 'INVALID_KEY',
      message: 'Missing or invalid public_key',
    };
  }

  const cleanKey = publicKey.trim().slice(0, 100);
  const supabase = getSupabaseAdmin();

  const { data: widget, error: widgetError } = await supabase
    .from('widgets')
    .select('id')
    .eq('public_key', cleanKey)
    .single();

  if (widgetError || !widget) {
    return {
      ok: false,
      status: 404,
      code: 'WIDGET_NOT_FOUND',
      message: 'Invalid widget key',
    };
  }

  const { data: event, error: eventError } = await supabase
    .from('cancellation_events')
    .select('id, widget_id')
    .eq('id', eventId)
    .eq('widget_id', widget.id)
    .single();

  if (eventError || !event) {
    return {
      ok: false,
      status: 404,
      code: 'EVENT_NOT_FOUND',
      message: 'Event not found for this widget',
    };
  }

  return { ok: true, widgetId: widget.id, event };
}
