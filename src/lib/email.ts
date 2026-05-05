/**
 * Transactional email helper.
 *
 * Reads SMTP config from environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * Falls back to Nodemailer's built-in `sendmail` transport when no SMTP
 * host is configured (useful for local dev / CI).
 *
 * In production replace the transport with any provider you prefer
 * (Resend, SendGrid, SES, etc.) — only `sendEmail` is called externally.
 */

import nodemailer from "nodemailer";

function createTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) {
    // Dev-only fallback — logs mail to console instead of sending
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER ?? "",
      pass: process.env.SMTP_PASS ?? "",
    },
  });
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const transport = createTransport();
  const from =
    process.env.SMTP_FROM ?? `"VisaHub" <no-reply@visahub.com>`;

  const info = await transport.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text ?? options.html.replace(/<[^>]+>/g, ""),
  });

  // When using jsonTransport (dev fallback) log instead of send
  if (!process.env.SMTP_HOST) {
    console.log("[email:dev]", JSON.stringify(info, null, 2));
  }
}

// ── Templates ──────────────────────────────────────────────────────────────

export function buildPasswordResetEmail(resetUrl: string): Pick<EmailOptions, "subject" | "html" | "text"> {
  return {
    subject: "Reset your VisaHub password",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#1e293b;margin-bottom:8px">Reset your password</h2>
        <p style="color:#475569;margin-bottom:24px">
          We received a request to reset the password for your VisaHub account.
          Click the button below — this link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;
                  padding:12px 24px;border-radius:6px;font-weight:600">
          Reset password
        </a>
        <p style="color:#94a3b8;font-size:13px;margin-top:32px">
          If you didn't request this, you can safely ignore this email.<br>
          The link will expire automatically.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
        <p style="color:#cbd5e1;font-size:12px">VisaHub &middot; Visa Application Platform</p>
      </div>
    `,
    text: `Reset your VisaHub password\n\nClick this link to reset your password (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
  };
}
