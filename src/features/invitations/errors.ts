type InvitationDatabaseError = {
  code?: string;
  message?: string;
};

const INVITATION_ERRORS = [
  {
    code: 'P0002',
    source: 'Invitation is invalid.',
    safe: 'This invitation is invalid.',
  },
  {
    code: '23505',
    source: 'Invitation has already been accepted.',
    safe: 'This invitation has already been accepted.',
  },
  {
    code: '42501',
    source: 'Invitation has been revoked.',
    safe: 'This invitation has been revoked. Ask a club administrator for a new link.',
  },
  {
    code: '22023',
    source: 'Invitation has expired.',
    safe: 'This invitation has expired. Ask a club administrator for a new link.',
  },
  {
    code: '42501',
    source: 'Invitation email does not match the signed-in account.',
    safe: 'This invitation belongs to a different account. Sign in with the invited email address.',
  },
] as const;

const GENERIC_INVITATION_ERROR = 'This invitation could not be accepted. Request a new link if the problem continues.';

export function mapInvitationAcceptanceError(error: InvitationDatabaseError) {
  const knownError = INVITATION_ERRORS.find(
    (candidate) => error.code === candidate.code && error.message?.includes(candidate.source),
  );

  return knownError?.safe ?? GENERIC_INVITATION_ERROR;
}
