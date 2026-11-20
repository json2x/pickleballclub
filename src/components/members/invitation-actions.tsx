'use client';

import { useActionState } from 'react';
import { Trash2 } from 'lucide-react';
import { revokeInvitationAction } from '@/features/members/actions';

export function RevokeInvitationButton({ clubId, invitationId }: { clubId: string; invitationId: string }) {
  const [, formAction, isPending] = useActionState(revokeInvitationAction, { status: 'idle' });

  return (
    <form action={formAction} className="inline-block">
      <input type="hidden" name="clubId" value={clubId} />
      <input type="hidden" name="invitationId" value={invitationId} />
      <button 
        type="submit" 
        disabled={isPending}
        className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
        title="Revoke invitation"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
