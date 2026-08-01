import { describe, expect, it } from 'vitest';

import { getFirstVisibleClubSlug, getRootDestination } from './routing';

describe('getRootDestination', () => {
  it('routes unauthenticated visitors to the public login URL', () => {
    expect(getRootDestination({ authenticated: false })).toBe('/login');
  });

  it('routes members with an active club to its dashboard', () => {
    expect(getRootDestination({ authenticated: true, activeClubSlug: 'side-spin' })).toBe(
      '/side-spin/dashboard',
    );
  });

  it('encodes an unexpected slug before placing it in a path', () => {
    expect(getRootDestination({ authenticated: true, activeClubSlug: 'club/night' })).toBe(
      '/club%2Fnight/dashboard',
    );
  });

  it('routes authenticated users without an active club to onboarding', () => {
    expect(getRootDestination({ authenticated: true, activeClubSlug: null })).toBe('/onboarding');
  });
});

describe('getFirstVisibleClubSlug', () => {
  it('uses membership recency order rather than club query order', () => {
    expect(
      getFirstVisibleClubSlug(
        [{ club_id: 'newest' }, { club_id: 'older' }],
        [
          { id: 'older', slug: 'older-club' },
          { id: 'newest', slug: 'newest-club' },
        ],
      ),
    ).toBe('newest-club');
  });

  it('skips clubs hidden by RLS and chooses the next visible active membership', () => {
    expect(
      getFirstVisibleClubSlug(
        [{ club_id: 'hidden' }, { club_id: 'visible' }],
        [{ id: 'visible', slug: 'visible-club' }],
      ),
    ).toBe('visible-club');
  });

  it('returns no fallback when the user has no visible active club', () => {
    expect(getFirstVisibleClubSlug([], [])).toBeNull();
  });
});
