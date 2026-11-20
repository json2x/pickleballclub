import type { InvitationEmailParams } from './email-service';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildInvitationEmailHtml(params: InvitationEmailParams): string {
  const inviterName = escapeHtml(params.inviterName);
  const clubName = escapeHtml(params.clubName);
  const role = escapeHtml(params.role);
  const inviteUrl = escapeHtml(params.inviteUrl);
  const formattedExpiry = escapeHtml(
    params.expiresAt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to join ${clubName}</title>
</head>
<body style="background-color: #09090b; margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <div style="max-width: 600px; width: 100%; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px; box-sizing: border-box; text-align: left;">
          <!-- Header Branding -->
          <div style="font-size: 24px; font-weight: 800; color: #6fb51e; letter-spacing: -0.5px; margin-bottom: 24px;">
            Pickle-lo
          </div>

          <!-- Main Content -->
          <h1 style="font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px;">
            You've been invited!
          </h1>
          <p style="font-size: 16px; line-height: 1.6; color: #e4e4e7; margin-bottom: 24px;">
            Hello,<br/><br/>
            <strong>${inviterName}</strong> has invited you to join <strong>${clubName}</strong> as a <strong>${role}</strong> on Pickle-lo Club Manager.
          </p>

          <!-- CTA Button -->
          <div style="margin: 32px 0; text-align: center;">
            <a href="${inviteUrl}" style="background-color: #6fb51e; color: #09090b; font-weight: 700; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px;">
              Accept Invitation
            </a>
          </div>

          <!-- Expiry Notice -->
          <p style="font-size: 14px; line-height: 1.5; color: #a1a1aa; margin-top: 24px; margin-bottom: 16px;">
            This invitation will expire on <strong>${formattedExpiry}</strong>.
          </p>

          <!-- Direct Link Fallback -->
          <p style="font-size: 12px; line-height: 1.5; color: #71717a; word-break: break-all; margin-bottom: 32px;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${inviteUrl}" style="color: #6fb51e; text-decoration: underline;">${inviteUrl}</a>
          </p>

          <!-- Footer -->
          <div style="border-top: 1px solid #27272a; padding-top: 20px; font-size: 12px; color: #71717a; text-align: center;">
            Pickle-lo Club Manager &bull; Elevate your pickleball community
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
