import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
        <Icon className="h-7 w-7 text-zinc-400" />
      </div>

      <h3 className="mb-1 text-lg font-semibold text-zinc-100">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-zinc-400">{description}</p>

      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-5 py-2.5',
            'bg-indigo-600 text-sm font-medium text-white',
            'transition-colors hover:bg-indigo-500',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900'
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
