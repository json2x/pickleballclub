import type { SupabaseClient, User } from '@supabase/supabase-js';

import type { Database } from '@/types/database.types';

import { createClient } from '../supabase/server';

export type VerifiedIdentity = {
  id: string;
  email?: string;
};

export async function getVerifiedIdentity(
  supabase?: SupabaseClient<Database>,
): Promise<VerifiedIdentity | null> {
  const client = supabase ?? (await createClient());
  const { data, error } = await client.auth.getClaims();

  if (error || !data?.claims.sub) {
    return null;
  }

  return {
    id: data.claims.sub,
    email: typeof data.claims.email === 'string' ? data.claims.email : undefined,
  };
}

export async function getCurrentUser(supabase?: SupabaseClient<Database>): Promise<User | null> {
  const client = supabase ?? (await createClient());
  const identity = await getVerifiedIdentity(client);

  if (!identity) {
    return null;
  }

  const { data, error } = await client.auth.getUser();
  return error ? null : data.user;
}
