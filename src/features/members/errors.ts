type DatabaseError = { code?: string; message?: string; details?: string };

export function mapMemberOperationError(error: DatabaseError): string {
  const msg = error.message || error.details || '';
  if (msg.includes('permission denied') || msg.includes('unauthorized') || error.code === '42501') {
    return 'You do not have permission to perform this action.';
  }
  if (msg.includes('owner protection') || msg.includes('cannot modify owner')) {
    return 'Club owner roles cannot be modified directly.';
  }
  if (msg.includes('self-modification') || msg.includes('cannot modify own')) {
    return 'You cannot modify your own role or status this way.';
  }
  if (msg.includes('not found')) {
    return 'The specified member was not found.';
  }
  return 'We could not complete this operation. Try again in a moment.';
}

export function mapInvitationOperationError(error: DatabaseError): string {
  const msg = error.message || error.details || '';
  if (error.code === '23505' || msg.includes('already exists')) {
    return 'An invitation already exists for this email.';
  }
  if (msg.includes('already accepted')) {
    return 'This invitation has already been accepted.';
  }
  if (msg.includes('already revoked')) {
    return 'This invitation has already been revoked.';
  }
  if (msg.includes('permission denied') || msg.includes('unauthorized') || error.code === '42501') {
    return 'You do not have permission to manage invitations.';
  }
  return 'We could not process the invitation. Try again in a moment.';
}
