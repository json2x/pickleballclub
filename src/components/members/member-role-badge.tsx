import { cn } from '@/lib/utils';

interface MemberRoleBadgeProps {
  role: 'owner' | 'admin' | 'member';
  size?: 'sm' | 'md';
}

export function MemberRoleBadge({ role, size = 'sm' }: MemberRoleBadgeProps) {
  const isSm = size === 'sm';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold capitalize border',
        isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        role === 'owner' && 'bg-secondary/20 text-secondary border-secondary/30',
        role === 'admin' && 'bg-primary-fixed/20 text-primary-fixed border-primary-fixed/30',
        role === 'member' && 'bg-surface-variant/60 text-on-surface-variant border-outline-variant/30'
      )}
    >
      {role}
    </span>
  );
}
