import { NextResponse, type NextRequest } from 'next/server';

import { getSafeRedirect } from '@/lib/auth/safe-redirect';
import { createActionClient } from '@/lib/supabase/server';

function getFailurePath(next: string) {
  return next === '/reset-password'
    ? '/forgot-password?error=invalid-link'
    : '/login?error=callback';
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = getSafeRedirect(requestUrl.searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(new URL(getFailurePath(next), requestUrl.origin));
  }

  const supabase = await createActionClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL(getFailurePath(next), requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
