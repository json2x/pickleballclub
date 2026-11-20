'use server';

import { revalidatePath } from 'next/cache';

import { getVerifiedIdentity } from '@/lib/auth/identity';
import { createActionClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

import type { MemberActionState } from './action-state';
import { mapInvitationOperationError, mapMemberOperationError } from './errors';
import {
  bulkInviteSchema,
  deactivateMemberSchema,
  getMemberFieldErrors,
  inviteMemberSchema,
  memberRoleChangeSchema,
  updateProfileSchema,
} from './validation';

function getText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export async function inviteMemberAction(
  _previousState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const clubId = getText(formData, 'clubId');
  const values = {
    email: getText(formData, 'email'),
    role: getText(formData, 'role') || 'member',
  };
  const parsed = inviteMemberSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields and try again.',
      fieldErrors: getMemberFieldErrors(parsed.error),
      values,
    };
  }

  const supabase = await createActionClient();
  const identity = await getVerifiedIdentity(supabase);

  if (!identity || !clubId) {
    return { status: 'error', message: 'You must be logged in to a club.' };
  }

  const args: Database['public']['Functions']['issue_club_invitation']['Args'] = {
    p_club_id: clubId,
    p_email: parsed.data.email,
    p_role: parsed.data.role as Database['public']['Enums']['club_role'],
  };

  const { data, error } = await supabase.rpc('issue_club_invitation', args);

  if (error || !data || data.length === 0) {
    return {
      status: 'error',
      message: mapInvitationOperationError(error ?? {}),
      values,
    };
  }

  revalidatePath(`/${clubId}/members`);

  return {
    status: 'success',
    outcome: 'invitation-sent',
    message: data[0].raw_token,
  };
}

export async function bulkInviteMembersAction(
  _previousState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const clubId = getText(formData, 'clubId');
  const values = {
    emails: getText(formData, 'emails'),
    role: getText(formData, 'role') || 'member',
  };
  const parsed = bulkInviteSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields and try again.',
      fieldErrors: getMemberFieldErrors(parsed.error),
      values,
    };
  }

  const supabase = await createActionClient();
  const identity = await getVerifiedIdentity(supabase);

  if (!identity || !clubId) {
    return { status: 'error', message: 'You must be logged in to a club.' };
  }

  let successCount = 0;
  let errorCount = 0;

  for (const email of parsed.data.emails) {
    const args: Database['public']['Functions']['issue_club_invitation']['Args'] = {
      p_club_id: clubId,
      p_email: email,
      p_role: parsed.data.role as Database['public']['Enums']['club_role'],
    };

    const { error } = await supabase.rpc('issue_club_invitation', args);
    if (error) {
      errorCount++;
    } else {
      successCount++;
    }
  }

  revalidatePath(`/${clubId}/members`);

  if (successCount === 0 && errorCount > 0) {
    return {
      status: 'error',
      message: 'Failed to send any invitations.',
      values,
    };
  }

  return {
    status: 'success',
    outcome: 'invitation-sent',
    message: `Successfully invited ${successCount} members.${errorCount > 0 ? ` Failed to invite ${errorCount}.` : ''}`,
  };
}

export async function revokeInvitationAction(
  _previousState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const clubId = getText(formData, 'clubId');
  const invitationId = getText(formData, 'invitationId');

  const supabase = await createActionClient();
  const identity = await getVerifiedIdentity(supabase);

  if (!identity || !clubId || !invitationId) {
    return { status: 'error', message: 'Invalid request.' };
  }

  const { error } = await supabase.rpc('revoke_club_invitation', {
    p_club_id: clubId,
    p_invitation_id: invitationId,
  });

  if (error) {
    return {
      status: 'error',
      message: mapInvitationOperationError(error),
    };
  }

  revalidatePath(`/${clubId}/members`);

  return {
    status: 'success',
    outcome: 'invitation-revoked',
  };
}

export async function updateMemberRoleAction(
  _previousState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const clubId = getText(formData, 'clubId');
  const values = {
    userId: getText(formData, 'userId'),
    newRole: getText(formData, 'newRole'),
    reason: getText(formData, 'reason'),
  };
  const parsed = memberRoleChangeSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Invalid request data.',
      fieldErrors: getMemberFieldErrors(parsed.error),
      values,
    };
  }

  const supabase = await createActionClient();
  const identity = await getVerifiedIdentity(supabase);

  if (!identity || !clubId) {
    return { status: 'error', message: 'You must be logged in to a club.' };
  }

  const { error } = await supabase.rpc('update_member_role', {
    p_club_id: clubId,
    p_user_id: parsed.data.userId,
    p_new_role: parsed.data.newRole,
    p_reason: parsed.data.reason || undefined,
  });

  if (error) {
    return {
      status: 'error',
      message: mapMemberOperationError(error),
      values,
    };
  }

  revalidatePath(`/${clubId}/members`);

  return {
    status: 'success',
    outcome: 'role-updated',
  };
}

export async function deactivateMemberAction(
  _previousState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const clubId = getText(formData, 'clubId');
  const values = {
    userId: getText(formData, 'userId'),
    reason: getText(formData, 'reason'),
  };
  const parsed = deactivateMemberSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Invalid request data.',
      fieldErrors: getMemberFieldErrors(parsed.error),
      values,
    };
  }

  const supabase = await createActionClient();
  const identity = await getVerifiedIdentity(supabase);

  if (!identity || !clubId) {
    return { status: 'error', message: 'You must be logged in to a club.' };
  }

  const { error } = await supabase.rpc('deactivate_member', {
    p_club_id: clubId,
    p_user_id: parsed.data.userId,
    p_reason: parsed.data.reason || undefined,
  });

  if (error) {
    return {
      status: 'error',
      message: mapMemberOperationError(error),
      values,
    };
  }

  revalidatePath(`/${clubId}/members`);

  return {
    status: 'success',
    outcome: 'member-deactivated',
  };
}

export async function updatePlayerProfileAction(
  _previousState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const clubId = getText(formData, 'clubId');
  const values = {
    skill_level: getText(formData, 'skill_level') || undefined,
    preferred_side: getText(formData, 'preferred_side') || undefined,
    bio: getText(formData, 'bio') || undefined,
  };
  const parsed = updateProfileSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields and try again.',
      fieldErrors: getMemberFieldErrors(parsed.error),
      values,
    };
  }

  const supabase = await createActionClient();
  const identity = await getVerifiedIdentity(supabase);

  if (!identity || !clubId) {
    return { status: 'error', message: 'You must be logged in to a club.' };
  }

  const { error } = await supabase.rpc('update_player_profile', {
    p_club_id: clubId,
    p_skill_level: parsed.data.skill_level,
    p_preferred_side: parsed.data.preferred_side,
    p_bio: parsed.data.bio,
  });

  if (error) {
    return {
      status: 'error',
      message: mapMemberOperationError(error),
      values,
    };
  }

  revalidatePath(`/${clubId}/members`);

  return {
    status: 'success',
    outcome: 'profile-updated',
  };
}
