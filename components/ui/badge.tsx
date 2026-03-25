'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
        success:
          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        warning:
          'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        error:
          'bg-red-500/20 text-red-300 border border-red-500/30',
        info:
          'bg-sky-500/20 text-sky-300 border border-sky-500/30',
        outline:
          'border border-zinc-700 text-zinc-300 bg-transparent',
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

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
