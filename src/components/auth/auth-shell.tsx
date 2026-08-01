import Image from 'next/image';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AuthShellProps = {
  title: string;
  subtitle: string;
  brandLead?: string;
  brandFinish?: string;
  purpleBrand?: boolean;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({
  title,
  subtitle,
  brandLead = 'Run your club.',
  brandFinish = 'Play more.',
  purpleBrand = false,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="auth-shell">
      <div className="auth-blob auth-blob-lime" aria-hidden="true" />
      <div className="auth-blob auth-blob-lavender" aria-hidden="true" />

      <div className="auth-card">
        <div className={cn('auth-brand', purpleBrand && 'auth-brand-purple')}>
          <div className="auth-brand-dots" aria-hidden="true" />
          <div className="auth-brand-content">
            <Image
              src="/brand-assets/mascot-pickle-lo-hero.png"
              width={1050}
              height={1498}
              alt="Pickle-lo mascot"
              className="auth-brand-mascot"
              priority
            />
            <p className="auth-brand-line auth-brand-line-lime">{brandLead}</p>
            <p className="auth-brand-line auth-brand-line-white">{brandFinish}</p>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-mobile-logo">
            <Image
              src="/brand-assets/logo-pickle-lo-primary.png"
              width={1725}
              height={912}
              alt="Pickle-lo"
              className="auth-mobile-logo-image"
            />
          </div>

          <header className="auth-header">
            <h1 className="auth-title">{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
          </header>

          {children}

          {footer ? <footer className="auth-footer">{footer}</footer> : null}
        </div>
      </div>
    </main>
  );
}
