export default function ClubLoading() {
  return (
    <main className="system-state" aria-busy="true" aria-live="polite">
      <div className="system-state__panel">
        <span className="system-state__spinner" aria-hidden="true" />
        <p>Loading club workspace…</p>
      </div>
    </main>
  );
}
