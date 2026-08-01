import { describe, expect, it } from 'vitest';

import { canManageClub } from './services';

describe('club permissions', () => {
  it.each(['owner', 'admin'] as const)('allows %s to see management metrics', (role) => {
    expect(canManageClub(role)).toBe(true);
  });

  it('keeps management metrics hidden from members', () => {
    expect(canManageClub('member')).toBe(false);
  });
});
