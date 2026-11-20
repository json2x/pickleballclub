'use client';

import { useState, useActionState } from 'react';
import { MoreVertical, Shield, UserX, AlertTriangle } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { updateMemberRoleAction, deactivateMemberAction } from '@/features/members/actions';

interface MemberActionsMenuProps {
  member: {
    user_id: string;
    display_name: string;
    role: 'owner' | 'admin' | 'member';
    status: string;
  };
  clubId: string;
  currentUserRole: 'owner' | 'admin' | 'member';
  currentUserId: string;
}

export function MemberActionsMenu({ member, clubId, currentUserRole, currentUserId }: MemberActionsMenuProps) {
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [, roleAction, isRolePending] = useActionState(updateMemberRoleAction, { status: 'idle' });
  const [deactivateState, deactivateAction, isDeactivatePending] = useActionState(deactivateMemberAction, { status: 'idle' });

  // Permissions
  const isSelf = member.user_id === currentUserId;
  const isTargetOwner = member.role === 'owner';
  const hasPermission = (currentUserRole === 'owner' || currentUserRole === 'admin') && !isSelf && !isTargetOwner;

  if (!hasPermission) {
    return (
      <button disabled className="p-1.5 text-slate-400 opacity-60 rounded-md cursor-not-allowed">
        <MoreVertical className="h-4 w-4" />
      </button>
    );
  }

  return (
    <>
      <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenu.Trigger asChild>
          <button className="p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors focus:outline-none">
            <MoreVertical className="h-5 w-5" />
          </button>
        </DropdownMenu.Trigger>
        
        <DropdownMenu.Portal>
          <DropdownMenu.Content 
            align="end"
            className="min-w-[200px] glass-panel bg-surface-container rounded-xl border border-outline-variant/30 p-1 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50"
          >
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger className="flex items-center w-full px-3 py-2 text-sm text-on-surface hover:bg-surface-variant/50 rounded-lg cursor-pointer outline-none select-none group">
                <Shield className="h-4 w-4 mr-2 text-on-surface-variant group-hover:text-primary-fixed" />
                Change Role
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent 
                  className="min-w-[150px] glass-panel bg-surface-container rounded-xl border border-outline-variant/30 p-1 shadow-lg z-50"
                  sideOffset={4}
                >
                  <form action={roleAction}>
                    <input type="hidden" name="clubId" value={clubId} />
                    <input type="hidden" name="userId" value={member.user_id} />
                    <input type="hidden" name="role" value="admin" />
                    <DropdownMenu.Item asChild>
                      <button 
                        type="submit" 
                        disabled={member.role === 'admin' || isRolePending}
                        className="flex w-full items-center px-3 py-2 text-sm text-on-surface hover:bg-surface-variant/50 rounded-lg cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Make Admin
                      </button>
                    </DropdownMenu.Item>
                  </form>
                  <form action={roleAction}>
                    <input type="hidden" name="clubId" value={clubId} />
                    <input type="hidden" name="userId" value={member.user_id} />
                    <input type="hidden" name="role" value="member" />
                    <DropdownMenu.Item asChild>
                      <button 
                        type="submit"
                        disabled={member.role === 'member' || isRolePending}
                        className="flex w-full items-center px-3 py-2 text-sm text-on-surface hover:bg-surface-variant/50 rounded-lg cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Make Member
                      </button>
                    </DropdownMenu.Item>
                  </form>
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>

            <DropdownMenu.Separator className="h-px bg-outline-variant/30 my-1" />

            <DropdownMenu.Item 
              onSelect={() => setShowDeactivateDialog(true)}
              className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer outline-none select-none"
            >
              <UserX className="h-4 w-4 mr-2" />
              Deactivate Member
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Dialog.Root open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 glass-panel rounded-2xl p-6 border border-outline-variant/30 bg-surface-container shadow-xl duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <AlertTriangle className="h-6 w-6" />
              <Dialog.Title className="text-xl font-headline-md">
                Deactivate Member
              </Dialog.Title>
            </div>
            
            <Dialog.Description className="text-sm text-on-surface-variant font-body-md">
              Are you sure you want to deactivate <strong>{member.display_name}</strong>? They will lose access to the club and will not be able to participate in matches.
            </Dialog.Description>

            {deactivateState.status === 'error' && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                {deactivateState.message || 'An error occurred.'}
              </div>
            )}

            <form action={deactivateAction} className="flex justify-end gap-3 mt-4">
              <input type="hidden" name="clubId" value={clubId} />
              <input type="hidden" name="userId" value={member.user_id} />
              
              <Dialog.Close asChild>
                <Button type="button" variant="outline" disabled={isDeactivatePending}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" variant="destructive" disabled={isDeactivatePending}>
                {isDeactivatePending ? 'Deactivating...' : 'Yes, Deactivate'}
              </Button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
