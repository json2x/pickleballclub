import { getSafeRedirect } from './safe-redirect';
import { getAppUrl } from '../supabase/env';

export function getAuthCallbackUrl(next = '/') {
  const callbackUrl = new URL('/auth/callback', getAppUrl());
  callbackUrl.searchParams.set('next', getSafeRedirect(next));
  return callbackUrl.toString();
}
