export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function jsonResponse(data, status = 200, extraHeaders = {}) {
  return Response.json(data, {
    status,
    headers: { ...CORS_HEADERS, ...extraHeaders },
  });
}

export function errorResponse(message, status = 500, code = 'ERROR', extraHeaders = {}) {
  return jsonResponse(
    { success: false, error: message, code },
    status,
    extraHeaders
  );
}

export async function parseJson(request) {
  try {
    return { body: await request.json(), error: null };
  } catch {
    return { body: null, error: 'Invalid JSON body' };
  }
}

export function sanitizeText(value, maxLength = 500) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function normalizeHttpUrl(value) {
  if (typeof value !== 'string') return null;

  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.toString().slice(0, 500);
  } catch {
    return null;
  }
}
