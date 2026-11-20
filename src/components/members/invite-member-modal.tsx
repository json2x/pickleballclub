'use client';

import { useActionState, useState } from 'react';
import { UserPlus, Copy, Check } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { inviteMemberAction } from '@/features/members/actions';

interface InviteMemberModalProps {
  clubId: string;
  clubSlug?: string;
}

export function InviteMemberModal({ clubId }: InviteMemberModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [state, formAction, isPending] = useActionState(inviteMemberAction, {
    status: 'idle',
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setCopied(false);
    }
  };

  const inviteUrl = state.status === 'success' && state.message ? state.message : null;

  const handleCopy = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button className="bg-[#a7e23e] hover:bg-[#9ed834] text-slate-900 font-semibold px-5 py-2.5 rounded-xl shadow-xs border-0 flex items-center gap-2 text-sm transition-all active:scale-95 cursor-pointer">
          <UserPlus className="h-4 w-4 stroke-[2.5]" />
          Invite Member
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 glass-panel rounded-2xl p-6 border border-outline-variant/30 bg-surface-container shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <Dialog.Title className="text-xl font-headline-md text-on-surface">
            Invite New Member
          </Dialog.Title>
          <Dialog.Description className="text-sm text-on-surface-variant font-body-md">
            Send an invitation to join your club. They will receive an email with a link to join.
          </Dialog.Description>

          {state.status === 'success' ? (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-primary-fixed/10 border border-primary-fixed/30 text-on-surface text-sm">
                Invitation issued successfully!
              </div>

              {inviteUrl && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-on-surface-variant">
                    Invitation Link (share directly if needed):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteUrl}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-surface-variant/40 border border-outline-variant/30 text-on-surface"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="shrink-0 gap-1.5"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="clubId" value={clubId} />

              {state.status === 'error' && state.message && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {state.message}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-on-surface">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="player@example.com"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-surface-variant/40 border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed/50"
                />
                {state.fieldErrors?.email && (
                  <p className="text-xs text-red-400">{state.fieldErrors.email[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="role" className="text-sm font-medium text-on-surface">
                  Club Role
                </label>
                <select
                  id="role"
                  name="role"
                  defaultValue="member"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-surface-variant/40 border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed/50"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                {state.fieldErrors?.role && (
                  <p className="text-xs text-red-400">{state.fieldErrors.role[0]}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Dialog.Close asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button type="submit" variant="primary" disabled={isPending}>
                  {isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
