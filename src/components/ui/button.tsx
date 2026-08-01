import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex min-h-target shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-ui px-4 font-sans text-sm font-semibold transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ui-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ui-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-ui-destructive',
  {
    variants: {
      variant: {
        primary: 'bg-ui-primary text-ui-primary-foreground hover:bg-ui-primary-hover',
        secondary: 'bg-ui-secondary text-ui-secondary-foreground hover:bg-ui-secondary-hover',
        outline:
          'border border-ui-border bg-ui-card text-ui-foreground shadow-ui-control hover:bg-ui-muted',
        ghost: 'text-ui-foreground hover:bg-ui-muted',
        destructive: 'bg-ui-destructive text-ui-destructive-foreground hover:bg-ui-destructive-hover',
      },
      size: {
        sm: 'px-3 text-ui-label',
        default: 'px-4',
        lg: 'min-h-12 px-6 text-base',
        icon: 'size-target p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
