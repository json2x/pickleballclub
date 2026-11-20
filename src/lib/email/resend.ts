import type { EmailResult, EmailService, InvitationEmailParams } from './email-service';
import { buildInvitationEmailHtml } from './templates';

export class ResendEmailService implements EmailService {
  private readonly apiKey: string;
  private readonly fromAddress: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.fromAddress = process.env.RESEND_FROM_EMAIL || 'Pickle-lo <noreply@pickle-lo.com>';
  }

  async sendInvitation(params: InvitationEmailParams): Promise<EmailResult> {
    try {
      const html = buildInvitationEmailHtml(params);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromAddress,
          to: [params.to],
          subject: `You're invited to join ${params.clubName} on Pickle-lo!`,
          html,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        return { success: false, error: `Email delivery failed (${response.status}): ${body}` };
      }

      const data = (await response.json()) as { id?: string };
      return { success: true, messageId: data.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error',
      };
    }
  }
}
