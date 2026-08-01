import Link from 'next/link';

export default function ClubNotFound() {
  return (
    <main className="system-state">
      <div className="system-state__panel">
        <p className="system-state__eyebrow">Club unavailable</p>
        <h1 className="system-state__title">This workspace can&apos;t be opened.</h1>
        <p>The club may not exist, or your account may not have an active membership.</p>
        <Link className="system-state__action" href="/">
          Return home
        </Link>
      </div>
    </main>
  );
}
