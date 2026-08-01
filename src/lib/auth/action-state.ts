export type AuthFieldValues = Partial<Record<'displayName' | 'email', string>>;

export type AuthActionState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: AuthFieldValues;
};

export const INITIAL_AUTH_ACTION_STATE: AuthActionState = { status: 'idle' };
