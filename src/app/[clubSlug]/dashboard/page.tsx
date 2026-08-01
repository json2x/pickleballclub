import { Clock3, MapPin, ShieldCheck, UserCheck, UserRoundPlus, UsersRound } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';

import { getClubWorkspace, getDashboardMetrics } from '@/features/clubs/services';
import { buildLoginRedirect } from '@/lib/auth/safe-redirect';

export const metadata: Metadata = { title: 'Club Dashboard | Pickleball Club' };

type DashboardPageProps = {
  params: Promise<{ clubSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function titleCase(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const [{ clubSlug }, query] = await Promise.all([params, searchParams]);
  const result = await getClubWorkspace(clubSlug);

  if (result.status === 'unauthenticated') {
    redirect(buildLoginRedirect(`/${encodeURIComponent(clubSlug)}/dashboard`));
  }

  if (result.status === 'unauthorized') {
    notFound();
  }

  const { workspace } = result;
  const metrics = await getDashboardMetrics(workspace.club.id, workspace.membership.role);
  const firstName = workspace.profile.display_name.split(/\s+/)[0] || workspace.profile.display_name;
  const canManage = workspace.membership.role === 'owner' || workspace.membership.role === 'admin';
  const notice = Array.isArray(query.notice) ? query.notice[0] : query.notice;

  return (
    <div className="dashboard-page">
      {notice === 'logo-upload-failed' ? (
        <div className="dashboard-notice" role="status" aria-live="polite">
          Your club is ready, but its logo could not be saved. You can continue using the club.
        </div>
      ) : null}
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Club dashboard</p>
          <h1>Good to see you, {firstName}.</h1>
          <p>Here&apos;s the real Phase 1 snapshot for {workspace.club.name}.</p>
        </div>
        <span className="dashboard-role-badge">
          <ShieldCheck aria-hidden="true" /> {titleCase(workspace.membership.role)}
        </span>
      </header>

      <section className="dashboard-stat-grid" aria-label="Club metrics">
        <article className="dashboard-stat-card">
          <span className="dashboard-stat-icon" aria-hidden="true">
            <UsersRound />
          </span>
          <div>
            <span>Active members</span>
            <strong>{metrics.activeMemberCount}</strong>
          </div>
        </article>

        {canManage ? (
          <>
            <article className="dashboard-stat-card">
              <span className="dashboard-stat-icon dashboard-stat-icon-purple" aria-hidden="true">
                <UserCheck />
              </span>
              <div>
                <span>Pending approvals</span>
                <strong>{metrics.pendingMembershipCount ?? 0}</strong>
              </div>
            </article>
            <article className="dashboard-stat-card">
              <span className="dashboard-stat-icon dashboard-stat-icon-ink" aria-hidden="true">
                <UserRoundPlus />
              </span>
              <div>
                <span>Open invitations</span>
                <strong>{metrics.outstandingInvitationCount ?? 0}</strong>
              </div>
            </article>
          </>
        ) : (
          <article className="dashboard-stat-card dashboard-stat-card-note">
            <span>Management metrics</span>
            <p>Pending requests and invitations are visible to club owners and admins.</p>
          </article>
        )}
      </section>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel" aria-labelledby="club-overview-title">
          <div className="dashboard-panel-heading">
            <div>
              <p className="dashboard-eyebrow">Current club</p>
              <h2 id="club-overview-title">{workspace.club.name}</h2>
            </div>
            <span className="dashboard-club-mark">
              {workspace.logoUrl ? (
                <Image
                  src={workspace.logoUrl}
                  width={64}
                  height={64}
                  alt={`${workspace.club.name} logo`}
                  className="club-logo-image"
                  unoptimized
                />
              ) : (
                <span aria-hidden="true">{workspace.club.name.slice(0, 1).toUpperCase()}</span>
              )}
            </span>
          </div>
          {workspace.club.description ? <p>{workspace.club.description}</p> : null}
          <dl className="dashboard-details">
            <div>
              <dt>
                <MapPin aria-hidden="true" /> Location
              </dt>
              <dd>{workspace.club.location}</dd>
            </div>
            <div>
              <dt>
                <ShieldCheck aria-hidden="true" /> Join policy
              </dt>
              <dd>{titleCase(workspace.club.join_policy)}</dd>
            </div>
            <div>
              <dt>
                <Clock3 aria-hidden="true" /> Timezone
              </dt>
              <dd>{workspace.club.timezone}</dd>
            </div>
          </dl>
        </section>

        <section className="dashboard-panel dashboard-coming-next" aria-labelledby="coming-next-title">
          <Image
            src="/brand-assets/mascot-pickle-lo-ready.png"
            width={1024}
            height={1536}
            alt=""
            className="dashboard-empty-mascot"
          />
          <div>
            <p className="dashboard-eyebrow">Coming next</p>
            <h2 id="coming-next-title">Events and ratings are warming up.</h2>
            <p>
              Phase 1 does not fabricate schedules, registrations, or rankings. Those operational
              panels will appear when their real workflows are implemented.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
