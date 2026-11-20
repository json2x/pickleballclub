import { BarChart3, CalendarDays, LayoutDashboard, Settings, UsersRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { signOutAction } from '@/features/auth/actions';
import type { ClubWorkspace } from '@/features/clubs/services';

import { ClubSwitcher } from './club-switcher';

function roleLabel(role: ClubWorkspace['membership']['role']) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join('');
}

export function ClubShell({ workspace, children }: { workspace: ClubWorkspace; children: ReactNode }) {
  const dashboardHref = `/${encodeURIComponent(workspace.club.slug)}/dashboard`;

  return (
    <div className="club-shell">
      <aside className="club-sidebar">
        <div className="club-sidebar-brand">
          <span className="club-sidebar-mark">
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
              <Image
                src="/brand-assets/mark-pickle-lo-p.png"
                width={512}
                height={512}
                alt=""
                className="club-sidebar-mark-image"
                priority
              />
            )}
          </span>
          <span>
            <strong>Pickle-lo</strong>
            <small>Club manager</small>
          </span>
        </div>

        <ClubSwitcher currentClubId={workspace.club.id} choices={workspace.clubChoices} />

        <nav className="club-sidebar-nav" aria-label="Club navigation">
          <Link className="club-nav-item club-nav-item-active" href={dashboardHref} aria-current="page">
            <LayoutDashboard aria-hidden="true" />
            Dashboard
          </Link>
          <span className="club-nav-item club-nav-item-disabled" aria-disabled="true">
            <CalendarDays aria-hidden="true" />
            Events <small>Coming next</small>
          </span>
          <Link className="club-nav-item" href={`/${encodeURIComponent(workspace.club.slug)}/members`}>
            <UsersRound aria-hidden="true" />
            Members
          </Link>
          <span className="club-nav-item club-nav-item-disabled" aria-disabled="true">
            <BarChart3 aria-hidden="true" />
            Stats <small>Coming next</small>
          </span>
          <span className="club-nav-item club-nav-item-disabled" aria-disabled="true">
            <Settings aria-hidden="true" />
            Settings <small>Coming next</small>
          </span>
        </nav>

        <div className="club-sidebar-account">
          <span className="club-account-avatar" aria-hidden="true">
            {initials(workspace.profile.display_name) || 'PL'}
          </span>
          <span className="club-account-copy">
            <strong>{workspace.profile.display_name}</strong>
            <small>{roleLabel(workspace.membership.role)}</small>
          </span>
          <form action={signOutAction}>
            <button className="club-signout-button" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="club-content">
        <div className="club-page-container">{children}</div>
      </main>

      <nav className="club-mobile-nav" aria-label="Mobile club navigation">
        <Link href={dashboardHref} aria-current="page">
          <LayoutDashboard aria-hidden="true" />
          Dashboard
        </Link>
        <Link href={`/${encodeURIComponent(workspace.club.slug)}/members`}>
          <UsersRound aria-hidden="true" />
          Members
        </Link>
        <span aria-disabled="true">
          <CalendarDays aria-hidden="true" />
          Events
        </span>
        <form action={signOutAction}>
          <button type="submit">Sign out</button>
        </form>
      </nav>
    </div>
  );
}
