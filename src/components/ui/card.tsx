import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col gap-6 rounded-ui border border-ui-border bg-ui-card p-6 text-ui-card-foreground shadow-ui-card',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ComponentProps<'header'>) {
  return <header data-slot="card-header" className={cn('grid gap-2', className)} {...props} />;
}

function CardTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      data-slot="card-title"
      className={cn('font-sans text-ui-title font-semibold text-ui-foreground', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-description"
      className={cn('font-sans text-sm text-ui-muted-foreground', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('font-sans', className)} {...props} />;
}

function CardFooter({ className, ...props }: ComponentProps<'footer'>) {
  return (
    <footer data-slot="card-footer" className={cn('flex items-center gap-3', className)} {...props} />
  );
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
