import { describe, expect, it } from 'vitest';

import { mapInvitationAcceptanceError } from './errors';

describe('mapInvitationAcceptanceError', () => {
  it.each([
    ['P0002', 'Invitation is invalid.', 'This invitation is invalid.'],
    ['23505', 'Invitation has already been accepted.', 'This invitation has already been accepted.'],
    [
      '42501',
      'Invitation has been revoked.',
      'This invitation has been revoked. Ask a club administrator for a new link.',
    ],
    [
      '22023',
      'Invitation has expired.',
      'This invitation has expired. Ask a club administrator for a new link.',
    ],
    [
      '42501',
      'Invitation email does not match the signed-in account.',
      'This invitation belongs to a different account. Sign in with the invited email address.',
    ],
  ])('maps known migration state %s safely', (code, message, expected) => {
    expect(mapInvitationAcceptanceError({ code, message })).toBe(expected);
  });

  it('recognizes a whitelisted message inside a provider wrapper', () => {
    expect(
      mapInvitationAcceptanceError({
        code: '22023',
        message: 'Database error: Invitation has expired.',
      }),
    ).toBe('This invitation has expired. Ask a club administrator for a new link.');
  });

  it('uses a generic message when a known code has an unrecognized message', () => {
    const arbitraryMessage = 'Sensitive database detail that must not be returned';
    const result = mapInvitationAcceptanceError({ code: '42501', message: arbitraryMessage });

    expect(result).toBe(
      'This invitation could not be accepted. Request a new link if the problem continues.',
    );
    expect(result).not.toContain(arbitraryMessage);
  });

  it('uses a generic message for unknown errors', () => {
    expect(mapInvitationAcceptanceError({ code: 'XX000', message: 'Internal failure' })).toBe(
      'This invitation could not be accepted. Request a new link if the problem continues.',
    );
  });
});
