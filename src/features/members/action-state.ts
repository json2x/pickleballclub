export type MemberFormValues = Partial<Record<string, string | number | boolean | null>>;

export type MemberActionState = {
  status: 'idle' | 'error' | 'success';
  outcome?: 'invitation-sent' | 'invitation-revoked' | 'role-updated' | 'member-deactivated' | 'profile-updated';
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: MemberFormValues;
};

export const INITIAL_MEMBER_ACTION_STATE: MemberActionState = { status: 'idle' };
