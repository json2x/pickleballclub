import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function Field({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="field" className={cn('grid gap-2', className)} {...props} />;
}

function FieldLabel({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        'font-sans text-ui-label font-medium uppercase tracking-wide text-ui-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn('font-sans text-sm text-ui-muted-foreground', className)}
      {...props}
    />
  );
}

function FieldError({ className, role = 'alert', ...props }: ComponentProps<'p'>) {
  return (
    <p
      role={role}
      data-slot="field-error"
      className={cn('font-sans text-sm font-medium text-ui-destructive', className)}
      {...props}
    />
  );
}

export { Field, FieldDescription, FieldError, FieldLabel };
