// ===========================================
//  RetainPulse — Lead Email Notifications
//  Sends email via Resend when a new lead submits /book
// ===========================================

import { Resend } from 'resend';

let resendClient = null;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://retainpulse.pro';

function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// ═══════════════════════════════════════════════════════════
//  1. Notification to Owner (you) — new lead
// ═══════════════════════════════════════════════════════════
export async function sendLeadNotificationToOwner({
  name,
  email,
  saasUrl,
  mrrRange,
  churnProblem,
}) {
  const resend = getResendClient();

  if (!resend) {
    console.warn('[RetainPulse][lead-email] RESEND_API_KEY missing');
    return { success: false, error: 'No API key' };
  }

  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    console.warn('[RetainPulse][lead-email] OWNER_EMAIL missing');
    return { success: false, error: 'Owner email not configured' };
  }
  const dashboardUrl = `${APP_URL}/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f7; margin: 0; padding: 40px 20px;">

      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <div style="background: #05050c; padding: 40px 32px; text-align: center; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -100px; left: 50%; transform: translateX(-50%); width: 400px; height: 400px; background: radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%); pointer-events: none;"></div>

          <div style="position: relative; display: inline-flex; align-items: center; gap: 10px; margin-bottom: 20px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%); display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12h3l2-7 4 14 2-7h7"/>
              </svg>
            </div>
            <span style="font-size: 20px; font-weight: 700; color: #ffffff;">
              Retain<span style="color: #a78bfa;">Pulse</span>
            </span>
          </div>

          <div style="position: relative; display: inline-block; padding: 6px 14px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: 100px; margin-bottom: 16px;">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981; margin-right: 6px; vertical-align: middle;"></span>
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6ee7b7; vertical-align: middle;">New Lead</span>
          </div>

          <h1 style="position: relative; color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; line-height: 1.2;">
            Someone wants to book.
          </h1>
          <p style="position: relative; color: #94a3b8; margin: 10px 0 0; font-size: 14px;">
            Here's what they shared.
          </p>
        </div>

        <!-- CONTENT -->
        <div style="padding: 32px;">

          <div style="margin-bottom: 22px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 8px;">Name</div>
            <div style="font-size: 15px; color: #111827; background: #f9fafb; padding: 14px 16px; border-radius: 12px; border: 1px solid #e5e7eb;">
              ${escapeHtml(name)}
            </div>
          </div>

          <div style="margin-bottom: 22px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 8px;">Email</div>
            <div style="font-size: 15px; color: #111827; background: #f9fafb; padding: 14px 16px; border-radius: 12px; border: 1px solid #e5e7eb; font-family: 'SF Mono', Monaco, monospace;">
              <a href="mailto:${escapeHtml(email)}" style="color: #8b5cf6; text-decoration: none;">${escapeHtml(email)}</a>
            </div>
          </div>

          <div style="margin-bottom: 22px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 8px;">SaaS URL</div>
            <div style="font-size: 15px; color: #111827; background: #f9fafb; padding: 14px 16px; border-radius: 12px; border: 1px solid #e5e7eb; font-family: 'SF Mono', Monaco, monospace;">
              <a href="${escapeHtml(saasUrl)}" style="color: #8b5cf6; text-decoration: none;">${escapeHtml(saasUrl)}</a>
            </div>
          </div>

          <div style="margin-bottom: 22px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 8px;">MRR Range</div>
            <div style="font-size: 15px; color: #111827; background: linear-gradient(135deg, #faf5ff 0%, #fdf4ff 100%); padding: 14px 16px; border-radius: 12px; border: 1px solid #e9d5ff; font-weight: 600;">
              ${escapeHtml(mrrRange)}
            </div>
          </div>

          ${churnProblem ? `
          <div style="margin-bottom: 22px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 8px;">Their Churn Problem</div>
            <div style="font-size: 14px; color: #374151; background: #f9fafb; padding: 14px 16px; border-radius: 12px; border: 1px solid #e5e7eb; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(churnProblem)}</div>
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 100px; font-weight: 600; font-size: 14px;">
              View Dashboard →
            </a>
          </div>
        </div>

        <!-- FOOTER -->
        <div style="padding: 24px 32px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            This lead was submitted via <a href="${APP_URL}/book" style="color: #8b5cf6; text-decoration: none; font-weight: 600;">retainpulse.pro/book</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: 'RetainPulse Leads <hello@retainpulse.pro>',
      to: [ownerEmail],
      replyTo: email,
      subject: `[RetainPulse Lead] ${name} — ${mrrRange}`,
      html,
    });

    if (result?.error) {
      console.error('[RetainPulse][lead-email] Resend error:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log('[RetainPulse][lead-email] Owner notified | ID:', result?.data?.id);
    return { success: true, id: result?.data?.id };
  } catch (err) {
    console.error('[RetainPulse][lead-email] Exception:', err.message);
    return { success: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════
//  2. Confirmation to Customer — "We received your request"
// ═══════════════════════════════════════════════════════════
export async function sendLeadConfirmationToCustomer({ name, email }) {
  const resend = getResendClient();

  if (!resend) {
    return { success: false, error: 'No API key' };
  }

  const firstName = name.split(' ')[0] || name;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f7; margin: 0; padding: 40px 20px;">

      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <div style="background: #05050c; padding: 40px 32px; text-align: center; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -100px; left: 50%; transform: translateX(-50%); width: 400px; height: 400px; background: radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%); pointer-events: none;"></div>

          <div style="position: relative; display: inline-flex; align-items: center; gap: 10px; margin-bottom: 20px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%); display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12h3l2-7 4 14 2-7h7"/>
              </svg>
            </div>
            <span style="font-size: 20px; font-weight: 700; color: #ffffff;">
              Retain<span style="color: #a78bfa;">Pulse</span>
            </span>
          </div>

          <h1 style="position: relative; color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; line-height: 1.2;">
            Got it, ${escapeHtml(firstName)}.
          </h1>
          <p style="position: relative; color: #94a3b8; margin: 10px 0 0; font-size: 14px;">
            Your request is in. Here's what happens next.
          </p>
        </div>

        <!-- CONTENT -->
        <div style="padding: 32px;">

          <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 24px;">
            Thanks for booking RetainPulse. I'll personally review your request and send you a Payoneer payment link within <strong style="color: #111827;">24 hours</strong>.
          </p>

          <div style="background: #f9fafb; border-left: 4px solid #8b5cf6; padding: 20px 24px; border-radius: 12px; margin-bottom: 24px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #8b5cf6; margin-bottom: 12px;">
              What's next
            </div>
            <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #374151; line-height: 1.8;">
              <li style="margin-bottom: 8px;">I review your SaaS and churn problem</li>
              <li style="margin-bottom: 8px;">You receive a Payoneer link for <strong>$100</strong> (installation fee)</li>
              <li style="margin-bottom: 8px;">Once paid, I install RetainPulse on your site within <strong>48 hours</strong></li>
              <li>After 7 days, if you're happy, you pay the remaining <strong>$149</strong></li>
            </ol>
          </div>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
            If you have any questions in the meantime, just reply to this email — it goes straight to me.
          </p>

          <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 13px; color: #9ca3af; margin: 0 0 12px;">
              Bookmark these for later:
            </p>
            <p style="margin: 0;">
              <a href="${APP_URL}/demo" style="color: #8b5cf6; text-decoration: none; font-weight: 600; font-size: 14px; margin-right: 16px;">Live demo</a>
              <a href="${APP_URL}/pricing" style="color: #8b5cf6; text-decoration: none; font-weight: 600; font-size: 14px;">Pricing</a>
            </p>
          </div>
        </div>

        <!-- FOOTER -->
        <div style="padding: 24px 32px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            RetainPulse · <a href="${APP_URL}" style="color: #8b5cf6; text-decoration: none; font-weight: 600;">retainpulse.pro</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: 'RetainPulse <hello@retainpulse.pro>',
      to: [email],
      replyTo: 'hello@retainpulse.pro',
      subject: `Got it, ${firstName} — here's what happens next`,
      html,
    });

    if (result?.error) {
      console.error('[RetainPulse][lead-email] Resend error:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log('[RetainPulse][lead-email] Customer confirmed | ID:', result?.data?.id);
    return { success: true, id: result?.data?.id };
  } catch (err) {
    console.error('[RetainPulse][lead-email] Exception:', err.message);
    return { success: false, error: err.message };
  }
}

// ===========================================
//  Helpers
// ===========================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}