import { describe, expect, it } from 'vitest';

import { mapCreateClubError, mapJoinClubError } from './errors';

describe('club database error mapping', () => {
  it('maps duplicate club slugs to a safe field error', () => {
    expect(mapCreateClubError({ code: '23505' })).toEqual({
      message: 'That club URL is already in use. Choose another slug.',
      fieldErrors: { slug: ['Choose a different club slug.'] },
    });
  });

  it.each([
    ['23505', 'You already have a membership or request for this club.'],
    ['42501', 'This club requires a private invitation link.'],
    ['P0002', 'We could not find a joinable club with that slug.'],
    ['XX000', 'We could not join that club. Try again in a moment.'],
  ])('maps join error %s without exposing database details', (code, message) => {
    expect(mapJoinClubError({ code })).toBe(message);
  });
});
