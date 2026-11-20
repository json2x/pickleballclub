import type { InvitationListItem } from '@/features/members/queries';
import { MemberRoleBadge } from './member-role-badge';
import { RevokeInvitationButton } from './invitation-actions';

interface InvitationsTableProps {
  invitations: InvitationListItem[];
  clubId: string;
  clubSlug?: string;
}

export function InvitationsTable({ invitations, clubId }: InvitationsTableProps) {
  if (!invitations || invitations.length === 0) {
    return (
      <div className="glass-panel rounded-xl border border-outline-variant/30 p-12 text-center">
        <h3 className="text-lg font-headline-md text-on-surface mb-2">No pending invitations</h3>
        <p className="text-on-surface-variant font-body-md">
          When you invite people to your club, their invitations will appear here.
        </p>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expired': return 'bg-surface-variant/60 text-on-surface-variant border-outline-variant/30';
      case 'revoked': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-surface-variant/60 text-on-surface-variant border-outline-variant/30';
    }
  };

  return (
    <div className="glass-panel rounded-xl border border-outline-variant/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30 text-sm font-semibold text-on-surface-variant bg-surface-variant/10">
              <th className="p-4 pl-6 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Invited By</th>
              <th className="p-4 font-medium">Sent Date</th>
              <th className="p-4 font-medium">Expires</th>
              <th className="p-4 pr-6 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {invitations.map((invitation) => (
              <tr key={invitation.id} className="hover:bg-surface-variant/20 transition-colors group">
                <td className="p-4 pl-6 text-on-surface font-medium">{invitation.email}</td>
                <td className="p-4">
                  <MemberRoleBadge role={invitation.role} />
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize border ${getStatusBadgeColor(invitation.status)}`}>
                    {invitation.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-on-surface-variant">{invitation.invited_by_name || 'System'}</td>
                <td className="p-4 text-sm text-on-surface-variant">
                  {new Date(invitation.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-sm text-on-surface-variant">
                  {new Date(invitation.expires_at).toLocaleDateString()}
                </td>
                <td className="p-4 pr-6 text-right">
                  {invitation.status === 'pending' && (
                    <div className="flex justify-end gap-1">
                      <RevokeInvitationButton clubId={clubId} invitationId={invitation.id} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
