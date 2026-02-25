import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-widest uppercase rounded-md border px-2.5 py-1',
  {
    variants: {
      variant: {
        default:  'bg-elevated text-text-secondary border-line',
        amber:    'bg-amber-500/10 text-amber-400 border-amber-500/30',
        blue:     'bg-blue-500/10 text-blue-400 border-blue-500/25',
        success:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
        error:    'bg-red-500/10 text-red-400 border-red-500/25',
        outline:  'bg-transparent text-text-secondary border-line-strong',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
