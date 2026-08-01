'use server';

import { redirect } from 'next/navigation';

import { getVerifiedIdentity } from '@/lib/auth/identity';
import { getClubDashboardDestination } from '@/lib/auth/routing';
import { buildLoginRedirect } from '@/lib/auth/safe-redirect';
import { createActionClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

import type { ClubActionState, ClubFormValues } from './action-state';
import { mapCreateClubError, mapJoinClubError } from './errors';
import {
  CLUB_ASSET_BUCKET,
  createClubLogoPath,
  hasValidClubLogoSignature,
  validateClubLogo,
} from './logo';
import {
  createClubSchema,
  getClubFieldErrors,
  joinClubSchema,
  switchClubSchema,
} from './validation';

function getText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export async function createClubAction(
  _previousState: ClubActionState,
  formData: FormData,
): Promise<ClubActionState> {
  const values: ClubFormValues = {
    name: getText(formData, 'name'),
    location: getText(formData, 'location'),
    slug: getText(formData, 'slug'),
    joinPolicy: getText(formData, 'joinPolicy'),
    description: getText(formData, 'description'),
    timezone: getText(formData, 'timezone'),
  };
  const parsed = createClubSchema.safeParse(values);
  const logo = validateClubLogo(formData.get('logo'));

  if (!parsed.success || !logo.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields and try again.',
      fieldErrors: {
        ...(parsed.success ? {} : getClubFieldErrors(parsed.error)),
        ...(logo.success ? {} : { logo: [logo.message] }),
      },
      values,
    };
  }

  const hasValidLogoSignature =
    !logo.file ||
    (logo.extension !== null && (await hasValidClubLogoSignature(logo.file, logo.extension)));

  if (!hasValidLogoSignature) {
    return {
      status: 'error',
      message: 'Check the highlighted fields and try again.',
      fieldErrors: { logo: ['Choose a JPEG, PNG, or WebP image.'] },
      values,
    };
  }

  const supabase = await createActionClient();
  const identity = await getVerifiedIdentity(supabase);

  if (!identity) {
    redirect(buildLoginRedirect('/onboarding/create-club'));
  }

  const args: Database['public']['Functions']['create_club']['Args'] = {
    p_name: parsed.data.name,
    p_location: parsed.data.location,
    p_slug: parsed.data.slug,
    p_join_policy: parsed.data.joinPolicy,
    ...(parsed.data.description ? { p_description: parsed.data.description } : {}),
    ...(parsed.data.timezone ? { p_timezone: parsed.data.timezone } : {}),
  };
  const { data: club, error } = await supabase.rpc('create_club', args);

  if (error || !club) {
    return {
      status: 'error',
      ...mapCreateClubError(error ?? {}),
      values,
    };
  }

  const dashboardPath = `/${encodeURIComponent(club.slug)}/dashboard`;

  if (!logo.file || !logo.extension) {
    redirect(dashboardPath);
  }

  const logoPath = createClubLogoPath(club.id, logo.extension);
  const clubAssets = supabase.storage.from(CLUB_ASSET_BUCKET);
  const { error: uploadError } = await clubAssets.upload(logoPath, logo.file, {
    contentType: logo.file.type,
    upsert: false,
    cacheControl: '3600',
  });

  if (uploadError) {
    redirect(`${dashboardPath}?notice=logo-upload-failed`);
  }

  const { data: updatedClub, error: metadataError } = await supabase
    .from('clubs')
    .update({ logo_path: logoPath })
    .eq('id', club.id)
    .eq('created_by', identity.id)
    .select('id')
    .maybeSingle();

  if (metadataError || !updatedClub) {
    await clubAssets.remove([logoPath]);
    redirect(`${dashboardPath}?notice=logo-upload-failed`);
  }

  redirect(dashboardPath);
}

export async function joinClubAction(
  _previousState: ClubActionState,
  formData: FormData,
): Promise<ClubActionState> {
  const rawSlug = getText(formData, 'slug');
  const parsed = joinClubSchema.safeParse({ slug: rawSlug });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Enter a valid club slug.',
      fieldErrors: getClubFieldErrors(parsed.error),
      values: { slug: rawSlug },
    };
  }

  const supabase = await createActionClient();
  const identity = await getVerifiedIdentity(supabase);

  if (!identity) {
    redirect(buildLoginRedirect('/onboarding/join-club'));
  }

  const { data: membership, error } = await supabase.rpc('join_club_by_slug', {
    p_slug: parsed.data.slug,
  });

  if (error || !membership) {
    return {
      status: 'error',
      message: mapJoinClubError(error ?? {}),
      values: { slug: parsed.data.slug },
    };
  }

  if (membership.status === 'pending') {
    return {
      status: 'success',
      outcome: 'pending-approval',
      message: 'Your request was sent. A club owner or admin must approve it before you can enter.',
      values: { slug: parsed.data.slug },
    };
  }

  const destination = await getClubDashboardDestination(
    supabase,
    identity.id,
    membership.club_id,
  );

  if (!destination) {
    return {
      status: 'error',
      message: 'The club was joined, but its dashboard could not be opened. Return to onboarding.',
      values: { slug: parsed.data.slug },
    };
  }

  redirect(destination);
}

export async function switchClubAction(
  _previousState: ClubActionState,
  formData: FormData,
): Promise<ClubActionState> {
  const parsed = switchClubSchema.safeParse({ clubId: getText(formData, 'clubId') });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Choose a valid club.',
      fieldErrors: getClubFieldErrors(parsed.error),
    };
  }

  const supabase = await createActionClient();
  const identity = await getVerifiedIdentity(supabase);

  if (!identity) {
    redirect('/login');
  }

  const { error } = await supabase.rpc('set_active_club', { p_club_id: parsed.data.clubId });

  if (error) {
    return { status: 'error', message: 'That club could not be selected.' };
  }

  const destination = await getClubDashboardDestination(
    supabase,
    identity.id,
    parsed.data.clubId,
  );

  if (!destination) {
    return { status: 'error', message: 'That club dashboard could not be opened.' };
  }

  redirect(destination);
}
