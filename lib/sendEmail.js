// ===========================================
//  RetainPulse — Email Notification
//  Sends cancellation alert via Resend when a customer cancels
// ===========================================

import { Resend } from 'resend';

// Init lazily (avoid crash if key missing)
let resendClient = null;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://retainpulse.pro';

function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Send cancellation alert to account owner
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function sendCancellationAlert({
  toEmail,
  customerEmail,
  reason,
  aiQuestion,
  followUpAnswer,
  offerShown,
}) {
  // --- Validate ---
  const resend = getResendClient();

  if (!resend) {
    console.warn('[RetainPulse][email] RESEND_API_KEY missing, skipping');
    return { success: false, error: 'No API key' };
  }

  if (!toEmail || typeof toEmail !== 'string') {
    console.warn('[RetainPulse][email] No recipient email, skipping');
    return { success: false, error: 'No recipient' };
  }

  // --- Build HTML ---
  const dashboardUrl = `${APP_URL}/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Cancellation Alert</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background: #f5f5f7; margin: 0; padding: 40px 20px; -webkit-font-smoothing: antialiased;">

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
            <span style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
              Retain<span style="color: #a78bfa;">Pulse</span>
            </span>
          </div>

          <div style="position: relative; display: inline-block; padding: 6px 14px; background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); border-radius: 100px; margin-bottom: 16px;">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #a78bfa; margin-right: 6px; vertical-align: middle;"></span>
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #c4b5fd; vertical-align: middle;">New Cancellation</span>
          </div>

          <h1 style="position: relative; color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.2;">
            Someone tried to cancel.
          </h1>
          <p style="position: relative; color: #94a3b8; margin: 10px 0 0; font-size: 14px; line-height: 1.5;">
            Here's what they said.
          </p>
        </div>

        <!-- CONTENT -->
        <div style="padding: 32px;">

          <!-- Customer -->
          <div style="margin-bottom: 22px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 8px;">
              Customer
            </div>
            <div style="font-size: 15px; color: #111827; background: #f9fafb; padding: 14px 16px; border-radius: 12px; border: 1px solid #e5e7eb; font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;">
              ${escapeHtml(customerEmail || 'Anonymous')}
            </div>
          </div>

          <!-- Reason -->
          <div style="margin-bottom: 22px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 8px;">
              Initial Reason
            </div>
            <div style="font-size: 15px; color: #111827; background: #f9fafb; padding: 14px 16px; border-radius: 12px; border: 1px solid #e5e7eb;">
              ${escapeHtml(reason || 'N/A')}
            </div>
          </div>

          ${aiQuestion ? `
          <div style="margin-bottom: 22px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #8b5cf6; margin-bottom: 8px;">
              ✦ AI Follow-up
            </div>
            <div style="font-size: 15px; color: #111827; background: linear-gradient(135deg, #faf5ff 0%, #fdf4ff 100%); padding: 14px 16px; border-radius: 12px; border: 1px solid #e9d5ff;">
              ${escapeHtml(aiQuestion)}
            </div>
          </div>
          ` : ''}

          ${followUpAnswer ? `
          <div style="margin-bottom: 22px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 8px;">
              Their Answer
            </div>
            <div style="font-size: 15px; color: #111827; background: #f9fafb; padding: 14px 16px; border-radius: 12px; border: 1px solid #e5e7eb;">
              ${escapeHtml(followUpAnswer)}
            </div>
          </div>
          ` : ''}

          ${offerShown ? `
          <div style="margin-bottom: 22px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #10b981; margin-bottom: 8px;">
              Offer Shown
            </div>
            <div style="font-size: 15px; color: #111827; background: #ecfdf5; padding: 14px 16px; border-radius: 12px; border: 1px solid #a7f3d0;">
              ${escapeHtml(offerShown)}
            </div>
          </div>
          ` : ''}

          <!-- CTA -->
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 100px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 14px rgba(139,92,246,0.3);">
              View in Dashboard →
            </a>
          </div>

        </div>

        <!-- FOOTER -->
        <div style="padding: 24px 32px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0 0 6px; line-height: 1.5;">
            You're receiving this because a customer triggered the cancellation flow on your site.
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            <a href="${APP_URL}" style="color: #8b5cf6; text-decoration: none; font-weight: 600;">retainpulse.pro</a>

          </p>
        </div>

      </div>

      <!-- Spacer -->
      <div style="height: 24px;"></div>

    </body>
    </html>
  `;

  // --- Send ---
  try {
    console.log('[RetainPulse][email] Attempting to send to:', toEmail);

    const result = await resend.emails.send({
      from: 'RetainPulse <hello@retainpulse.pro>',
      to: [toEmail],
      replyTo: 'hello@retainpulse.pro',
      subject: `🔔 New cancellation: ${customerEmail || 'Anonymous'}`,
      html,
    });

    if (result?.error) {
      console.error('[RetainPulse][email] Resend returned error:', result.error);
      return { success: false, error: result.error.message || 'Resend error' };
    }

    console.log('[RetainPulse][email] ✓ Sent | ID:', result?.data?.id);
    return { success: true, id: result?.data?.id };
  } catch (err) {
    console.error('[RetainPulse][email] Exception:', err.message);
    return { success: false, error: err.message };
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}