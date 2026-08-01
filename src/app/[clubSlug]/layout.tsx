import { notFound, redirect } from 'next/navigation';

import { ClubShell } from '@/components/clubs/club-shell';
import { getClubWorkspace } from '@/features/clubs/services';
import { buildLoginRedirect } from '@/lib/auth/safe-redirect';

type ClubLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ clubSlug: string }>;
}>;

export default async function ClubLayout({ children, params }: ClubLayoutProps) {
  const { clubSlug } = await params;
  const result = await getClubWorkspace(clubSlug);

  if (result.status === 'unauthenticated') {
    redirect(buildLoginRedirect(`/${encodeURIComponent(clubSlug)}/dashboard`));
  }

  if (result.status === 'unauthorized') {
    notFound();
  }

  return <ClubShell workspace={result.workspace}>{children}</ClubShell>;
}
