'use client';

import { useActionState } from 'react';

import { acceptInvitationAction } from '@/features/invitations/actions';
import { INITIAL_AUTH_ACTION_STATE } from '@/lib/auth/action-state';

import { AuthFormFeedback, AuthSubmitButton } from './form-controls';

export function InviteAcceptForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(acceptInvitationAction, INITIAL_AUTH_ACTION_STATE);

  return (
    <form className="invite-form" action={formAction}>
      <input type="hidden" name="token" value={token} />
      <AuthFormFeedback state={state} />
      <AuthSubmitButton idle="Accept Invitation" pending="Accepting Invitation…" />
    </form>
  );
}
