import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const feedbackStateVariants = cva(
  'flex flex-col items-center gap-3 rounded-ui border p-6 text-center font-sans',
  {
    variants: {
      tone: {
        neutral: 'border-ui-border bg-ui-card text-ui-foreground',
        info: 'border-ui-info/30 bg-ui-info-soft text-ui-info',
        success: 'border-ui-success/30 bg-ui-success-soft text-ui-success',
        error: 'border-ui-destructive/30 bg-ui-destructive-soft text-ui-destructive',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

type FeedbackStateProps = ComponentProps<'section'> & VariantProps<typeof feedbackStateVariants>;

function FeedbackState({ className, tone, role, ...props }: FeedbackStateProps) {
  return (
    <section
      role={role ?? (tone === 'error' ? 'alert' : 'status')}
      data-slot="feedback-state"
      className={cn(feedbackStateVariants({ tone }), className)}
      {...props}
    />
  );
}

function FeedbackStateIcon({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="feedback-state-icon"
      className={cn('flex size-target items-center justify-center rounded-full bg-current/10', className)}
      {...props}
    />
  );
}

function FeedbackStateTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      data-slot="feedback-state-title"
      className={cn('font-sans text-ui-title font-semibold text-current', className)}
      {...props}
    />
  );
}

function FeedbackStateDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="feedback-state-description"
      className={cn('max-w-prose font-sans text-sm text-current/80', className)}
      {...props}
    />
  );
}

function FeedbackStateActions({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="feedback-state-actions"
      className={cn('mt-1 flex flex-wrap items-center justify-center gap-3', className)}
      {...props}
    />
  );
}

export {
  FeedbackState,
  FeedbackStateActions,
  FeedbackStateDescription,
  FeedbackStateIcon,
  FeedbackStateTitle,
  feedbackStateVariants,
};
export type { FeedbackStateProps };
