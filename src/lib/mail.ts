/**
 * Dev-mode mail sink. UÇK Connect has no SMTP/email provider configured in
 * this environment, so instead of sending real email we log the message and
 * return the direct action link so the UI can surface it to the user
 * ("mënyra demo"). Swap this module's internals for a real provider
 * (Resend, SES, etc.) when credentials are available — callers only depend
 * on the exported function signatures, not the delivery mechanism.
 */

interface DevMail {
  to: string;
  subject: string;
  actionUrl: string;
}

export function sendVerificationEmail(to: string, token: string, subject: string): DevMail {
  const actionUrl = `/verify-email?token=${token}`;
  const mail = { to, subject, actionUrl };
  console.log(`[dev-mail] To: ${to} | ${mail.subject} | ${actionUrl}`);
  return mail;
}

export function sendPasswordResetEmail(to: string, token: string, subject: string): DevMail {
  const actionUrl = `/reset-password?token=${token}`;
  const mail = { to, subject, actionUrl };
  console.log(`[dev-mail] To: ${to} | ${mail.subject} | ${actionUrl}`);
  return mail;
}
