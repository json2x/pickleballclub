'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="system-state">
      <div className="system-state__panel">
        <p className="system-state__eyebrow">Something went wrong</p>
        <h1 className="system-state__title">We couldn&apos;t load this page.</h1>
        <p>Try again. If the problem continues, contact your club administrator.</p>
        <button className="system-state__action" type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
