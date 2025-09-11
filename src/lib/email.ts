import axios from 'axios';
import logger from './logging/logger';

export interface SendEmailOptions {
  to: string | { email: string; name?: string } | Array<string | { email: string; name?: string }>;
  subject: string;
  html: string;
  text?: string;
  tags?: string[];
}

function normalizeRecipients(to: SendEmailOptions['to']) {
  const arr = Array.isArray(to) ? to : [to];
  return arr.map(r => (typeof r === 'string' ? { email: r } : r));
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const enabled = (process.env.EMAIL_ENABLED || 'false').toLowerCase() === 'true';
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM_ADDRESS;
  const fromName = process.env.EMAIL_FROM_NAME || 'NoReply';

  if (!enabled) {
    logger.debug('[email] EMAIL_ENABLED not true – skipping send.');
    return;
  }
  if (!apiKey || !fromEmail) {
    logger.warn('[email] Missing BREVO_API_KEY or EMAIL_FROM_ADDRESS – email disabled.');
    return;
  }

  try {
    const payload = {
      sender: { email: fromEmail, name: fromName },
      to: normalizeRecipients(options.to),
      subject: options.subject,
      htmlContent: options.html,
      textContent: options.text || options.html.replace(/<[^>]+>/g, ''),
      tags: options.tags,
    };

    await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      timeout: 10000,
    });
    logger.info(`[email] Sent email to ${payload.to.map((t: any)=>t.email).join(', ')} subject="${options.subject}"`);
  } catch (err: any) {
    const status = err?.response?.status;
    const data = err?.response?.data;
    logger.error(`[email] Failed to send email: status=${status} err=${err.message} body=${JSON.stringify(data)}`);
  }
}

// Convenience helpers (extend as needed)
export async function sendWelcomeEmail(to: string, name?: string) {
  const subject = 'Welcome to YOHOP! 🎉';
  const safeName = name ? name.split(/\s+/)[0] : '';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#222;background:#f9fafb;padding:24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#111827;padding:18px 24px;">
            <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:600;">YOHOP</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <p style="margin-top:0;">Hi ${safeName || 'there'},</p>
            <p style="margin:16px 0;">Welcome to <strong>YOHOP</strong> — we’re excited to have you on board! Your account is set up and you’ve already earned your signup points.</p>
            <p style="margin:16px 0;">Here’s what you can do next:</p>
            <ol style="padding-left:20px;margin:16px 0;">
              <li><strong>Explore deals</strong> near you and start checking in.</li>
              <li><strong>Earn points</strong> for check-ins and activity.</li>
              <li><strong>Share your referral code</strong> (find it in your profile) to earn bonus points when friends join.</li>
            </ol>
            <p style="margin:16px 0;">Need help? Just reply to this email — we actually read these.</p>
            <p style="margin:24px 0 0;">Cheers,<br/>The YOHOP Team</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f3f4f6;padding:16px 24px;font-size:12px;color:#6b7280;">
            <p style="margin:0;">You’re receiving this because you created a YOHOP account. If this wasn’t you, ignore this email.</p>
          </td>
        </tr>
      </table>
    </div>
  `;
  await sendEmail({ to: { email: to }, subject, html, tags: ['welcome'] });
}

// Notify a referrer that someone used their code successfully.
export async function sendReferralSuccessEmail(params: { to: string; referrerName?: string; referredEmail: string; referralCode: string }) {
  const { to, referrerName, referredEmail, referralCode } = params;
  const safeName = referrerName ? referrerName.split(/\s+/)[0] : '';
  const subject = 'Your referral just joined YOHOP! 🎉';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#222;background:#f9fafb;padding:24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#111827;padding:18px 24px;">
            <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:600;">YOHOP</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <p style="margin-top:0;">Hi ${safeName || 'there'},</p>
            <p style="margin:16px 0;">Great news — <strong>${referredEmail}</strong> just signed up using your referral code <code style="background:#f3f4f6;padding:2px 4px;border-radius:4px;">${referralCode}</code>.</p>
            <p style="margin:16px 0;">You’ve earned referral progress toward rewards. Keep sharing your code to climb the leaderboard and unlock more points.</p>
            <p style="margin:16px 0;">Need your code again? You can always find it in your profile.</p>
            <p style="margin:24px 0 0;">Thanks for growing the community!<br/>The YOHOP Team</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f3f4f6;padding:16px 24px;font-size:12px;color:#6b7280;">
            <p style="margin:0;">You’re receiving this because someone joined YOHOP using your referral code.</p>
          </td>
        </tr>
      </table>
    </div>
  `;
  await sendEmail({ to: { email: to }, subject, html, tags: ['referral-success'] });
}

// Simple birthday greeting email
export async function sendBirthdayEmail(params: { to: string; name?: string }) {
  const { to, name } = params;
  const first = name ? name.split(/\s+/)[0] : 'there';
  const subject = 'Happy Birthday from YOHOP! 🎂';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#222;background:#f9fafb;padding:24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#111827;padding:18px 24px;">
            <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:600;">YOHOP</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <p style="margin-top:0;">Hi ${first},</p>
            <p style="margin:16px 0;">All of us at <strong>YOHOP</strong> wish you a very Happy Birthday! 🎉</p>
            <p style="margin:16px 0;">We hope you discover great deals and earn tons of points today. Treat yourself!</p>
            <p style="margin:24px 0 0;">Cheers,<br/>The YOHOP Team</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f3f4f6;padding:16px 24px;font-size:12px;color:#6b7280;">
            <p style="margin:0;">You’re receiving this because your birthday is set in YOHOP. If this seems wrong you can update your profile.</p>
          </td>
        </tr>
      </table>
    </div>`;
  await sendEmail({ to: { email: to }, subject, html, tags: ['birthday'] });
}
