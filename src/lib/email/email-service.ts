export interface InvitationEmailParams {
  to: string;
  inviterName: string;
  clubName: string;
  inviteUrl: string;
  role: 'admin' | 'member';
  expiresAt: Date;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailService {
  sendInvitation(params: InvitationEmailParams): Promise<EmailResult>;
}

export function getEmailService(): EmailService {
  // Lazy import to avoid pulling Resend into bundles that don't need it
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ResendEmailService } = require('./resend') as typeof import('./resend');
    return new ResendEmailService(apiKey);
  }
  // Development fallback: log to console
  return {
    async sendInvitation(params) {
      console.log('[EmailService] DEV MODE — Invitation email:', {
        to: params.to,
        clubName: params.clubName,
        role: params.role,
        inviteUrl: params.inviteUrl,
      });
      return { success: true, messageId: `dev-${Date.now()}` };
    },
  };
}
