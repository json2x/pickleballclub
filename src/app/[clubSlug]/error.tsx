'use client';

export default function ClubError({ reset }: { reset: () => void }) {
  return (
    <main className="system-state">
      <div className="system-state__panel">
        <p className="system-state__eyebrow">Workspace unavailable</p>
        <h1 className="system-state__title">We couldn&apos;t load this club.</h1>
        <p>Try again. If the problem continues, return to your selected club from the home page.</p>
        <button className="system-state__action" type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
