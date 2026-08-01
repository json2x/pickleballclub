import { describe, expect, it } from 'vitest';

import { buildLoginRedirect, getSafeRedirect } from './safe-redirect';

describe('getSafeRedirect', () => {
  it('keeps relative application paths and query strings', () => {
    expect(getSafeRedirect('/club/dashboard?tab=events')).toBe('/club/dashboard?tab=events');
  });

  it.each(['https://example.com', '//example.com', 'javascript:alert(1)', null, undefined])(
    'rejects unsafe destination %s',
    (value) => {
      expect(getSafeRedirect(value, '/login')).toBe('/login');
    },
  );

  it('rejects backslash-based authority confusion', () => {
    expect(getSafeRedirect('/\\example.com', '/login')).toBe('/login');
  });

  it('drops fragments so they cannot carry sensitive values', () => {
    expect(getSafeRedirect('/invite?next=club#token')).toBe('/invite?next=club');
  });

  it('encodes a verified next path in a login redirect', () => {
    expect(buildLoginRedirect('/invite/token?source=email')).toBe(
      '/login?next=%2Finvite%2Ftoken%3Fsource%3Demail',
    );
  });
});
