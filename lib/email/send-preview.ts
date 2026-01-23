import { Resend } from 'resend';

interface SendPreviewParams {
  to: string;
  businessName: string;
  businessLogo: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
  businessWebsite: string | null;
  businessTagline: string | null;
  beforeImageUrl: string;
  afterImageUrl: string;
  styleLabel: string;
  personalMessage: string;
  quoteAmount: number | null;
  previewUrl: string;
}

export async function sendPreviewEmail({
  to,
  businessName,
  businessLogo,
  businessPhone,
  businessEmail,
  businessWebsite,
  businessTagline,
  beforeImageUrl,
  afterImageUrl,
  styleLabel,
  personalMessage,
  quoteAmount,
  previewUrl,
}: SendPreviewParams) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resend = new Resend(resendApiKey);
  const clientDomain = process.env.NEXT_PUBLIC_CLIENT_DOMAIN || 'renderlab.com';

  const contactSection = [
    businessPhone && `<p style="margin: 4px 0; color: #374151;">📞 ${businessPhone}</p>`,
    businessEmail && `<p style="margin: 4px 0; color: #374151;">📧 ${businessEmail}</p>`,
    businessWebsite && `<p style="margin: 4px 0; color: #374151;">🌐 <a href="${businessWebsite}" style="color: #3B82F6; text-decoration: none;">${businessWebsite.replace(/^https?:\/\//, '')}</a></p>`,
  ].filter(Boolean).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 32px 24px; text-align: center;">
        ${businessLogo ? `<img src="${businessLogo}" alt="${businessName}" style="max-height: 60px; max-width: 200px;">` : `<h1 style="margin: 0; font-size: 24px; color: #111827;">${businessName}</h1>`}
      </td>
    </tr>
    <tr>
      <td style="padding: 0 24px 24px;">
        <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.5;">Hi there,</p>
        <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.5;">${personalMessage.replace(/\n/g, '<br>')}</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 24px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="48%" style="vertical-align: top;">
              <p style="margin: 0 0 8px; color: #6B7280; font-size: 12px; text-transform: uppercase;">Before</p>
              <img src="${beforeImageUrl}" alt="Before" style="width: 100%; border-radius: 8px; border: 1px solid #E5E7EB;">
            </td>
            <td width="4%"></td>
            <td width="48%" style="vertical-align: top;">
              <p style="margin: 0 0 8px; color: #6B7280; font-size: 12px; text-transform: uppercase;">${styleLabel}</p>
              <img src="${afterImageUrl}" alt="After" style="width: 100%; border-radius: 8px; border: 2px solid #F59E0B;">
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 24px 24px; text-align: center;">
        <a href="${previewUrl}" style="display: inline-block; padding: 14px 32px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Interactive Preview</a>
      </td>
    </tr>
    ${quoteAmount ? `
    <tr>
      <td style="padding: 0 24px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F4F6; border-radius: 8px; padding: 16px;">
          <tr>
            <td>
              <p style="margin: 0; color: #6B7280; font-size: 14px;">Estimated Quote</p>
              <p style="margin: 4px 0 0; color: #111827; font-size: 24px; font-weight: 600;">$${quoteAmount.toLocaleString()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ` : ''}
    <tr>
      <td style="padding: 24px; border-top: 1px solid #E5E7EB;">
        <p style="margin: 0 0 12px; color: #6B7280; font-size: 14px; font-weight: 600;">Questions? Get in touch:</p>
        ${contactSection}
        <p style="margin: 16px 0 4px; color: #111827; font-weight: 600;">${businessName}</p>
        ${businessTagline ? `<p style="margin: 0; color: #6B7280; font-size: 14px;">${businessTagline}</p>` : ''}
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const { error } = await resend.emails.send({
    from: `noreply@${clientDomain}`,
    to,
    subject: `Your ${styleLabel} Preview`,
    html,
  });

  if (error) {
    console.error('[Email] Send error:', error);
    throw error;
  }

  return { success: true };
}
