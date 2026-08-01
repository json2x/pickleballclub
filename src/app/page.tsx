import { redirect } from 'next/navigation';

import { resolveRootDestination } from '@/lib/auth/routing';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  if (!hasSupabaseEnv()) {
    redirect('/login');
  }

  const supabase = await createClient();
  redirect(await resolveRootDestination(supabase));
}
