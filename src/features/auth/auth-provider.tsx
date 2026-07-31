import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { supabase } from '@/services/supabase/client';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  deepLinkError: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(() => Boolean(supabase));
  const [deepLinkError, setDeepLinkError] = useState<string | null>(null);

  useEffect(() => {
    const authClient = supabase;
    if (!authClient) {
      return;
    }

    let active = true;
    let authEventReceived = false;

    const applyAuthUrl = async (url: string | null) => {
      if (!url || Platform.OS === 'web') return;

      try {
        if (active) setDeepLinkError(null);
        const parsedUrl = new URL(url);
        const hash = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
        const code = parsedUrl.searchParams.get('code');
        const accessToken = hash.get('access_token');
        const refreshToken = hash.get('refresh_token');

        const { error } = code
          ? await authClient.auth.exchangeCodeForSession(code)
          : accessToken && refreshToken
            ? await authClient.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
            : { error: null };

        if (error) throw error;
      } catch {
        if (!active) return;
        setDeepLinkError('This sign-in link is invalid or has expired. Request a new email link.');
      }
    };

    const { data } = authClient.auth.onAuthStateChange((_event, nextSession) => {
      authEventReceived = true;
      if (!active) return;
      setSession(nextSession);
      setLoading(false);
    });

    void authClient.auth.getSession().then(({ data: sessionData }) => {
      if (!active || authEventReceived) return;
      setSession(sessionData.session);
      setLoading(false);
    });

    const urlSubscription = Linking.addEventListener('url', ({ url }) => {
      void applyAuthUrl(url);
    });
    void Linking.getInitialURL().then(applyAuthUrl);

    if (Platform.OS !== 'web' && AppState.currentState === 'active') {
      authClient.auth.startAutoRefresh();
    }

    const appStateSubscription = Platform.OS === 'web'
      ? null
      : AppState.addEventListener('change', (state) => {
          if (state === 'active') authClient.auth.startAutoRefresh();
          else authClient.auth.stopAutoRefresh();
        });

    return () => {
      active = false;
      data.subscription.unsubscribe();
      urlSubscription.remove();
      appStateSubscription?.remove();
      if (Platform.OS !== 'web') authClient.auth.stopAutoRefresh();
    };
  }, []);

  const value = useMemo(
    () => ({ session, loading, deepLinkError }),
    [deepLinkError, loading, session],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
