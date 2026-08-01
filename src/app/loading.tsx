export default function Loading() {
  return (
    <main className="system-state" aria-busy="true" aria-live="polite">
      <div className="system-state__panel">
        <span className="system-state__spinner" aria-hidden="true" />
        <p>Loading Pickle-lo…</p>
      </div>
    </main>
  );
}
