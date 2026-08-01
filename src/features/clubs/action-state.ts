export type ClubFormValues = Partial<
  Record<'name' | 'location' | 'slug' | 'joinPolicy' | 'description' | 'timezone', string>
>;

export type ClubActionState = {
  status: 'idle' | 'error' | 'success';
  outcome?: 'pending-approval';
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: ClubFormValues;
};

export const INITIAL_CLUB_ACTION_STATE: ClubActionState = { status: 'idle' };
