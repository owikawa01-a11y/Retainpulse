import { createClient } from '@supabase/supabase-js';

let adminClient = null;

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase server environment variables');
  }

  adminClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

export async function getAuthenticatedUser(request) {
  const authorization = request.headers.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return { user: null, error: 'Missing authorization token' };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(match[1]);

    if (error || !data?.user) {
      return { user: null, error: 'Invalid or expired session' };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('[RetainPulse][auth] Failed to validate session:', error.message);
    return { user: null, error: 'Authentication service unavailable' };
  }
}
