'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils/cn';

function getProgressColor(value: number): string {
  if (value < 33) return 'bg-red-500';
  if (value < 66) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  showPercentage?: boolean;
  label?: string;
  colorVariant?: 'auto' | 'indigo' | 'success' | 'warning' | 'error';
}

const colorMap: Record<string, string> = {
  indigo: 'bg-indigo-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
};

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value = 0,
      showPercentage = false,
      label,
      colorVariant = 'auto',
      ...props
    },
    ref
  ) => {
    const clampedValue = Math.min(100, Math.max(0, value));
    const barColor =
      colorVariant === 'auto'
        ? getProgressColor(clampedValue)
        : colorMap[colorVariant] ?? 'bg-indigo-500';

    return (
      <div className="w-full space-y-1.5">
        {(label || showPercentage) && (
          <div className="flex items-center justify-between">
            {label && (
              <span className="text-sm font-medium text-zinc-300">{label}</span>
            )}
            {showPercentage && (
              <span className="text-sm tabular-nums text-zinc-400">
                {Math.round(clampedValue)}%
              </span>
            )}
          </div>
        )}
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            'relative h-3 w-full overflow-hidden rounded-full bg-zinc-800',
            className
          )}
          value={clampedValue}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-in-out',
              barColor
            )}
            style={{ width: `${clampedValue}%` }}
          />
        </ProgressPrimitive.Root>
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
