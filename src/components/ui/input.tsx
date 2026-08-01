import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type InputProps = ComponentProps<'input'>;

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex min-h-target w-full rounded-ui border border-ui-input bg-ui-card px-3 py-2 font-sans text-sm text-ui-foreground shadow-ui-control outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ui-muted-foreground focus-visible:border-ui-ring focus-visible:ring-2 focus-visible:ring-ui-ring/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-ui-destructive aria-invalid:ring-2 aria-invalid:ring-ui-destructive/20',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
export type { InputProps };
