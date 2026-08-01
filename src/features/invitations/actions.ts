'use server';

import { redirect } from 'next/navigation';

import type { AuthActionState } from '@/lib/auth/action-state';
import { getVerifiedIdentity } from '@/lib/auth/identity';
import { getClubDashboardDestination } from '@/lib/auth/routing';
import { buildLoginRedirect } from '@/lib/auth/safe-redirect';
import { getFieldErrors, invitationTokenSchema } from '@/lib/auth/validation';
import { createActionClient } from '@/lib/supabase/server';

import { mapInvitationAcceptanceError } from './errors';

export async function acceptInvitationAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const value = formData.get('token');
  const parsed = invitationTokenSchema.safeParse({ token: typeof value === 'string' ? value : '' });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'This invitation is invalid.',
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  const supabase = await createActionClient();
  const identity = await getVerifiedIdentity(supabase);

  if (!identity) {
    redirect(buildLoginRedirect(`/invite/${encodeURIComponent(parsed.data.token)}`));
  }

  const { data: membership, error: acceptanceError } = await supabase.rpc(
    'accept_club_invitation',
    { p_token: parsed.data.token },
  );

  if (acceptanceError || !membership) {
    return {
      status: 'error',
      message: mapInvitationAcceptanceError(acceptanceError ?? {}),
    };
  }

  const { error: selectionError } = await supabase.rpc('set_active_club', {
    p_club_id: membership.club_id,
  });

  if (selectionError) {
    redirect('/');
  }

  const destination = await getClubDashboardDestination(
    supabase,
    identity.id,
    membership.club_id,
  );

  redirect(destination ?? '/');
}
