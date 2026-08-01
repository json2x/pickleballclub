import { ArrowLeft, MapPin, Search, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { JoinClubForm } from '@/components/clubs/join-club-form';
import { Button } from '@/components/ui/button';
import { clubSearchSchema } from '@/features/clubs/validation';
import { searchJoinableClubs } from '@/features/clubs/services';

export const metadata: Metadata = { title: 'Join a Club | Pickleball Club' };

type JoinClubPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function policyLabel(policy: 'open' | 'approval' | 'invite_only') {
  return policy === 'open' ? 'Instant join' : policy === 'approval' ? 'Approval required' : 'Invite only';
}

export default async function JoinClubPage({ searchParams }: JoinClubPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : (params.q ?? '');
  const parsedQuery = clubSearchSchema.safeParse({ q: rawQuery });
  const result = parsedQuery.success
    ? await searchJoinableClubs(parsedQuery.data.q)
    : { status: 'invalid' as const, clubs: [] };

  return (
    <main className="onboarding-page onboarding-join-page">
      <Link className="onboarding-back-link" href="/onboarding">
        <ArrowLeft aria-hidden="true" />
        Back to club choices
      </Link>

      <header className="onboarding-section-header onboarding-join-header">
        <p className="onboarding-eyebrow">Find your community · Step 2 of 3</p>
        <h1 className="onboarding-title">Join a club</h1>
        <p className="onboarding-lede">
          Search by club name or location, then join instantly or request approval.
        </p>
      </header>

      <form className="club-search-form" action="/onboarding/join-club" method="get" role="search">
        <label className="sr-only" htmlFor="club-search">
          Search clubs by name or location
        </label>
        <Search className="club-search-icon" aria-hidden="true" />
        <input
          className="club-search-input"
          id="club-search"
          name="q"
          type="search"
          defaultValue={rawQuery}
          placeholder="Search club name, city, or exact slug"
          aria-invalid={!parsedQuery.success || undefined}
          aria-describedby={!parsedQuery.success ? 'club-search-error' : undefined}
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>
      {!parsedQuery.success ? (
        <p className="club-search-error" id="club-search-error" role="alert">
          {parsedQuery.error.flatten().fieldErrors.q?.join(' ')}
        </p>
      ) : null}

      <div className="join-layout">
        <section className="join-results" aria-labelledby="join-results-title">
          <div className="join-results-heading">
            <h2 id="join-results-title">{rawQuery ? 'Search results' : 'Joinable clubs'}</h2>
            {result.status === 'ready' ? <span>{result.clubs.length} found</span> : null}
          </div>

          {result.status === 'invalid' ? (
            <div className="join-empty-state" role="status">
              <strong>Update the search above.</strong>
              <span>The results will refresh after the query is valid.</span>
            </div>
          ) : result.status === 'error' ? (
            <div className="join-empty-state" role="alert">
              <strong>Clubs could not be loaded.</strong>
              <span>Try the search again in a moment.</span>
            </div>
          ) : result.clubs.length === 0 ? (
            <div className="join-empty-state" role="status">
              <strong>No joinable clubs found.</strong>
              <span>Check the spelling, try a nearby city, or use the exact slug form.</span>
            </div>
          ) : (
            <ul className="join-result-list">
              {result.clubs.map((club) => (
                <li className="join-result-card" key={club.id}>
                  <div className="join-result-mark" aria-hidden="true">
                    {club.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="join-result-copy">
                    <h3>{club.name}</h3>
                    <p>
                      <MapPin aria-hidden="true" /> {club.location}
                    </p>
                    <span className="join-policy-chip">
                      <ShieldCheck aria-hidden="true" /> {policyLabel(club.join_policy)}
                    </span>
                  </div>
                  <JoinClubForm slug={club.slug} compact />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="join-side-card" aria-labelledby="join-exact-title">
          <h2 id="join-exact-title">Know the exact slug?</h2>
          <p>Enter only the public club slug shown after pickle-lo.club/.</p>
          <JoinClubForm />
          <a className="onboarding-text-link" href="#invitation-help">
            Have a private invitation link?
          </a>
          <div className="invitation-help" id="invitation-help">
            <strong>Private invitations use their full link.</strong>
            <p>
              Open the complete link you received. Invitation tokens are handled only on the secure
              invitation page, never in this slug field.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
