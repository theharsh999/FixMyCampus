import { Resend } from "resend";
import { ComplaintEmail } from "../emails/ComplaintEmail.js";

let resendInstance = null;

function getResend() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("Email skipped: RESEND_API_KEY not configured");
      return null;
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

/**
 * Send a complaint notification email via Resend + react-email.
 *
 * @param {string} to            – recipient email
 * @param {string} subject       – email subject
 * @param {string} text          – plain-text fallback
 * @param {object} [emailProps]  – props forwarded to ComplaintEmail component
 */
export const sendEmail = async (to, subject, text, emailProps) => {
  const resend = getResend();
  if (!resend) return;

  const from = process.env.MAIL_FROM || "FixMyCampus <onboarding@resend.dev>";

  console.log("Sending email to:", to);

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    text,
    ...(emailProps ? { react: ComplaintEmail(emailProps) } : {}),
  });

  if (error) {
    console.error("Resend error:", error);
    return;
  }

  console.log("Email sent:", data?.id);
};
