import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { refreshAccessToken } from '@/api/client';
import { Spinner } from '@/components/ui/Feedback';
import { useAuthStore } from '@/store/auth-store';

/**
 * Runs once before the router renders. If the saved access token has expired
 * (e.g. the user comes back the next day), it silently trades the refresh-token
 * cookie for a new one first. That way guards and queries see the real state —
 * still signed in, or properly signed out — instead of flashing a redirect to
 * /login while a refresh is still in flight.
 */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(() => !useAuthStore.getState().isAccessTokenExpired());

  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    // refreshAccessToken() never rejects: on failure it logs the user out and returns null.
    void refreshAccessToken().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-900">
        <Spinner label="Restoring your session" />
      </div>
    );
  }
  return <>{children}</>;
}
