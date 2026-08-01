import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthShell } from '@/components/auth/auth-shell';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { getVerifiedIdentity } from '@/lib/auth/identity';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Choose a New Password | Pickleball Club' };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const identity = await getVerifiedIdentity(supabase);

  if (!identity) {
    redirect('/forgot-password?error=invalid-link');
  }

  return (
    <AuthShell
      title="New Password"
      subtitle="Choose a strong password you haven’t used for this account before."
      brandLead="Fresh password."
      brandFinish="Same great game."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
