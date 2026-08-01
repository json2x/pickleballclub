import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { CreateClubForm } from '@/components/clubs/create-club-form';

export const metadata: Metadata = { title: 'Create Your Club | Pickleball Club' };

export default function CreateClubPage() {
  return (
    <main className="onboarding-page onboarding-form-page">
      <Link className="onboarding-back-link" href="/onboarding">
        <ArrowLeft aria-hidden="true" />
        Back to club choices
      </Link>

      <section className="onboarding-form-card" aria-labelledby="create-club-title">
        <header className="onboarding-section-header">
          <p className="onboarding-eyebrow">Club setup · Step 2 of 3</p>
          <h1 className="onboarding-title" id="create-club-title">
            Create your club
          </h1>
          <p className="onboarding-lede">
            Give your community a recognizable home. You&apos;ll become the club owner when setup is
            complete.
          </p>
        </header>
        <CreateClubForm />
      </section>
    </main>
  );
}
