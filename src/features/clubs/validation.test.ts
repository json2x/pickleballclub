import { describe, expect, it } from 'vitest';

import { clubSearchSchema, createClubSchema, joinClubSchema, switchClubSchema } from './validation';

describe('club validation', () => {
  it('accepts a complete create-club payload and trims optional values', () => {
    const result = createClubSchema.safeParse({
      name: ' Riverside Pickleball ',
      location: ' Quezon City ',
      slug: 'riverside-pickleball',
      joinPolicy: 'approval',
      description: ' Community play ',
      timezone: '',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Riverside Pickleball');
      expect(result.data.description).toBe('Community play');
      expect(result.data.timezone).toBeUndefined();
    }
  });

  it.each(['Uppercase', 'double--hyphen', '-leading', 'trailing-'])('rejects invalid slug %s', (slug) => {
    expect(
      createClubSchema.safeParse({
        name: 'Valid Club',
        location: 'Valid location',
        slug,
        joinPolicy: 'open',
        description: '',
        timezone: '',
      }).success,
    ).toBe(false);
  });

  it('normalizes exact join slugs to lowercase', () => {
    const result = joinClubSchema.safeParse({ slug: '  Riverside-Club ' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe('riverside-club');
    }
  });

  it('limits GET search state and validates switch identifiers', () => {
    expect(clubSearchSchema.safeParse({ q: 'x'.repeat(101) }).success).toBe(false);
    expect(switchClubSchema.safeParse({ clubId: 'not-a-uuid' }).success).toBe(false);
  });

  it('rejects invalid optional timezone identifiers', () => {
    expect(
      createClubSchema.safeParse({
        name: 'Valid Club',
        location: 'Valid location',
        slug: 'valid-club',
        joinPolicy: 'approval',
        description: '',
        timezone: 'Somewhere/Imaginary',
      }).success,
    ).toBe(false);
  });
});
