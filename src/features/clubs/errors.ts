import type { ClubActionState } from './action-state';

type DatabaseError = { code?: string };

export function mapCreateClubError(error: DatabaseError): Pick<ClubActionState, 'message' | 'fieldErrors'> {
  if (error.code === '23505') {
    return {
      message: 'That club URL is already in use. Choose another slug.',
      fieldErrors: { slug: ['Choose a different club slug.'] },
    };
  }

  return { message: 'We could not create the club. Try again in a moment.' };
}

export function mapJoinClubError(error: DatabaseError): string {
  if (error.code === '23505') {
    return 'You already have a membership or request for this club.';
  }

  if (error.code === '42501') {
    return 'This club requires a private invitation link.';
  }

  if (error.code === 'P0002') {
    return 'We could not find a joinable club with that slug.';
  }

  return 'We could not join that club. Try again in a moment.';
}
