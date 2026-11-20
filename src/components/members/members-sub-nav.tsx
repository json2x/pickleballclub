'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MembersSubNavProps {
  clubSlug: string;
  currentUserRole?: 'owner' | 'admin' | 'member';
}

export function MembersSubNav({ clubSlug }: MembersSubNavProps) {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Directory',
      href: `/${clubSlug}/members`,
      active: pathname === `/${clubSlug}/members`,
    },
    {
      name: 'Invitations',
      href: `/${clubSlug}/members/invitations`,
      active: pathname === `/${clubSlug}/members/invitations`,
    },
  ];

  return (
    <div className="border-b border-slate-200/60 w-full mb-6">
      <nav className="flex space-x-6" aria-label="Members navigation tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              'whitespace-nowrap py-2.5 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
              tab.active
                ? 'border-[#6fb51e] text-[#476800] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            )}
            aria-current={tab.active ? 'page' : undefined}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
