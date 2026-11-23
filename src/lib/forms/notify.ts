import { Resend } from 'resend';
import { getSiteSection } from '@/lib/cms/sections';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export async function sendAdminAlert(subject: string, rows: Array<[string, string | undefined]>) {
  const to = process.env.ADMIN_ALERT_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL ?? 'Shalom Logistics <onboarding@resend.dev>';

  if (!resend || !to) return;

  const listHtml = rows
    .filter(([, val]) => Boolean(val))
    .map(
      ([label, val]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;border-bottom:1px solid #eee;">${escapeHtml(
          label
        )}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${escapeHtml(
          val!
        )}</td></tr>`
    )
    .join('');

  try {
    await resend.emails.send({
      from,
      to,
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:600px;color:#111;">
          <h2 style="margin-bottom:12px;">${escapeHtml(subject)}</h2>
          <table style="width:100%;border-collapse:collapse;">${listHtml}</table>
        </div>
      `,
    });
  } catch (err) {
    console.error('Resend alert failed:', err);
  }
}

export async function sendSubscriberWelcome(email: string) {
  const from = process.env.RESEND_FROM_EMAIL ?? 'Shalom Logistics <onboarding@resend.dev>';
  if (!resend) return;

  const defaults = {
    logo_url: '/images/SHALOM.png',
    banner_bg: '#004D2E',
    accent_color: '#D4AF37',
    subject: 'Welcome to Shalom Logistics Updates',
    heading: 'Welcome to Shalom Logistics!',
    body: "Thank you for subscribing. You'll receive moving tips, seasonal relocation offers, and service updates across Nairobi and Kenya.",
    cta_label: 'Get a free quote',
    cta_url: '/quote',
    phone: '+254 751 794 728',
    footer_note: '— The Shalom Logistics Team',
  };
  const { content } = await getSiteSection('email_welcome', defaults);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? '';
  const logoUrl = /^https?:\/\//i.test(content.logo_url)
    ? content.logo_url
    : `${siteUrl}${content.logo_url.startsWith('/') ? '' : '/'}${content.logo_url}`;
  const ctaUrl = /^https?:\/\//i.test(content.cta_url)
    ? content.cta_url
    : `${siteUrl}${content.cta_url.startsWith('/') ? '' : '/'}${content.cta_url}`;

  try {
    await resend.emails.send({
      from,
      to: email,
      subject: content.subject,
      html: `
        <div style="margin:0 auto;padding:24px 12px;background:#f4f6f5;font-family:Arial,sans-serif;color:#111;line-height:1.6;">
          <div style="max-width:600px;margin:0 auto;overflow:hidden;border-radius:12px;background:#fff;">
            <div style="padding:30px 24px;text-align:center;background:${escapeHtml(content.banner_bg)};">
              <img src="${escapeHtml(logoUrl)}" alt="Shalom Logistics" width="150" style="display:inline-block;max-width:100%;height:auto;" />
            </div>
            <div style="padding:32px 28px;">
              <h1 style="margin:0 0 18px;color:${escapeHtml(content.accent_color)};font-size:26px;line-height:1.25;">${escapeHtml(content.heading)}</h1>
              <p style="margin:0 0 20px;">${escapeHtml(content.body)}</p>
              <p style="margin:0 0 24px;">Planning a move soon? Call or WhatsApp us on <strong>${escapeHtml(content.phone)}</strong> for a free quote.</p>
              <p style="margin:0 0 26px;text-align:center;">
                <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:13px 22px;border-radius:8px;background:${escapeHtml(content.accent_color)};color:#111;text-decoration:none;font-weight:bold;">${escapeHtml(content.cta_label)}</a>
              </p>
              <p style="margin:0;color:#555;font-size:13px;">${escapeHtml(content.footer_note)}</p>
            </div>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('Resend welcome email failed:', err);
  }
}
