/**
 * Pluggable email sender. Configure SMTP_HOST / SMTP_PORT / SMTP_USER /
 * SMTP_PASS / SMTP_FROM (see .env.example) to send real email — for example
 * with Resend, Postmark, SendGrid's SMTP relay, or any standard SMTP
 * provider. Without those env vars set, emails are logged to the console
 * instead so password reset etc. still work end-to-end in local development.
 */
const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
function getTransporter() {
  if (!transporter) {
    const nodemailer = require("nodemailer");
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  if (!smtpConfigured) {
    console.log(`[mailer] SMTP not configured — email NOT sent. Would have sent to ${to}:\n  Subject: ${subject}\n  ${text}`);
    return { sent: false, dev: true };
  }
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to, subject, text, html
  });
  return { sent: true };
}

module.exports = { sendEmail, smtpConfigured };
