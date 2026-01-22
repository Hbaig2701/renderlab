import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!resend) {
    console.log('[Email] Resend not configured, skipping email');
    return false;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'RenderLab <noreply@renderlab.com>',
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}
