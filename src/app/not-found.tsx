import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="system-state">
      <div className="system-state__panel">
        <p className="system-state__eyebrow">404</p>
        <h1 className="system-state__title">That page is out of bounds.</h1>
        <p>The link may be outdated, or you may not have access to this club page.</p>
        <Link className="system-state__action" href="/">
          Return to Pickle-lo
        </Link>
      </div>
    </main>
  );
}
