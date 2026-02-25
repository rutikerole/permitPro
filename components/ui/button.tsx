'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles shared by all buttons
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold text-sm leading-none',
    'rounded-lg border transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
    'disabled:pointer-events-none disabled:opacity-40',
    'cursor-pointer select-none',
  ],
  {
    variants: {
      variant: {
        // Filled amber — primary CTA
        primary: [
          'bg-amber-500 text-gray-950 border-amber-500',
          'hover:bg-amber-400 hover:border-amber-400',
          'active:bg-amber-600',
          'shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_28px_rgba(245,158,11,0.35)]',
        ],
        // Outline amber — secondary CTA
        secondary: [
          'bg-transparent text-amber-400 border-amber-500/60',
          'hover:bg-amber-500/10 hover:border-amber-400 hover:text-amber-300',
          'active:bg-amber-500/20',
        ],
        // Ghost — nav/utility buttons
        ghost: [
          'bg-transparent text-text-secondary border-transparent',
          'hover:bg-elevated hover:text-text-primary hover:border-line',
          'active:bg-overlay',
        ],
        // Destructive
        destructive: [
          'bg-red-500/10 text-red-400 border-red-500/40',
          'hover:bg-red-500/20 hover:border-red-400',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
