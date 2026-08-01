import { ArrowRight, Building2, UsersRound } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Get Started | Pickleball Club' };

export default function OnboardingPage() {
  return (
    <main className="onboarding-page onboarding-welcome">
      <section className="onboarding-welcome-copy" aria-labelledby="onboarding-title">
        <p className="onboarding-eyebrow">Let&apos;s get you on court</p>
        <h1 className="onboarding-title" id="onboarding-title">
          How do you want to get started?
        </h1>
        <p className="onboarding-lede">
          Build a new home for your community or join a club that already plays with Pickle-lo.
        </p>

        <div className="onboarding-choice-grid">
          <Link className="onboarding-choice-card" href="/onboarding/create-club">
            <span className="onboarding-choice-icon" aria-hidden="true">
              <Building2 />
            </span>
            <span className="onboarding-choice-copy">
              <strong>Create a Club</strong>
              <span>Set up your club, membership rules, and management workspace.</span>
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>

          <Link className="onboarding-choice-card" href="/onboarding/join-club">
            <span className="onboarding-choice-icon onboarding-choice-icon-purple" aria-hidden="true">
              <UsersRound />
            </span>
            <span className="onboarding-choice-copy">
              <strong>Join a Club</strong>
              <span>Find your community by name, location, or exact club slug.</span>
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="onboarding-mascot-panel" aria-hidden="true">
        <div className="onboarding-court-lines" />
        <Image
          src="/brand-assets/mascot-pickle-lo-hero.png"
          width={1050}
          height={1498}
          alt=""
          className="onboarding-mascot"
          priority
        />
        <p>One setup. More play.</p>
      </div>
    </main>
  );
}
