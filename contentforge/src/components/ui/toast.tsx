'use client'

import { useEffect, useCallback } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore, type Notification } from '@/lib/stores/ui-store'

const icons: Record<Notification['type'], React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const variants: Record<Notification['type'], string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  error: 'border-red-500/30 bg-red-500/10 text-red-300',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
}

const iconColors: Record<Notification['type'], string> = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-amber-400',
}

function ToastItem({ notification }: { notification: Notification }) {
  const removeNotification = useUIStore((s) => s.removeNotification)
  const Icon = icons[notification.type]

  useEffect(() => {
    const timer = setTimeout(() => {
      removeNotification(notification.id)
    }, 5000)
    return () => clearTimeout(timer)
  }, [notification.id, removeNotification])

  return (
    <ToastPrimitive.Root
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 shadow-lg',
        'data-[state=open]:animate-[slideIn_200ms_ease-out]',
        'data-[state=closed]:animate-[slideOut_100ms_ease-in]',
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
        'data-[swipe=cancel]:translate-x-0',
        'data-[swipe=end]:animate-[slideOut_100ms_ease-in]',
        variants[notification.type]
      )}
      onOpenChange={(open) => {
        if (!open) removeNotification(notification.id)
      }}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconColors[notification.type])} />
      <ToastPrimitive.Description className="flex-1 text-sm">
        {notification.message}
      </ToastPrimitive.Description>
      <ToastPrimitive.Close
        className="shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:text-zinc-200"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const notifications = useUIStore((s) => s.notifications)

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      {notifications.map((notification) => (
        <ToastItem key={notification.id} notification={notification} />
      ))}
      <ToastPrimitive.Viewport
        className={cn(
          'fixed right-0 top-0 z-[100] m-0 flex max-w-[420px] flex-col gap-2 p-6',
          'outline-none'
        )}
      />
    </ToastPrimitive.Provider>
  )
}

export function useToast() {
  const addNotification = useUIStore((s) => s.addNotification)
  const removeNotification = useUIStore((s) => s.removeNotification)
  const clearNotifications = useUIStore((s) => s.clearNotifications)
  const notifications = useUIStore((s) => s.notifications)

  const toast = useCallback(
    (type: Notification['type'], message: string) => {
      addNotification({ type, message })
    },
    [addNotification]
  )

  return {
    toast,
    notifications,
    removeNotification,
    clearNotifications,
    success: (message: string) => toast('success', message),
    error: (message: string) => toast('error', message),
    info: (message: string) => toast('info', message),
    warning: (message: string) => toast('warning', message),
  }
}
