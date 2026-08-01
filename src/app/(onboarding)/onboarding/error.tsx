'use client';

export default function OnboardingError({ reset }: { reset: () => void }) {
  return (
    <main className="system-state">
      <div className="system-state__panel">
        <p className="system-state__eyebrow">Club setup unavailable</p>
        <h1 className="system-state__title">We couldn&apos;t load onboarding.</h1>
        <p>Try again. Your account and club data have not been changed.</p>
        <button className="system-state__action" type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
