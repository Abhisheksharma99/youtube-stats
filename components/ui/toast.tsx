'use client';

import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = 'ToastViewport';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-xl transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border-zinc-700 bg-zinc-900 text-zinc-100',
        success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        error: 'border-red-500/30 bg-red-500/10 text-red-300',
        warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        info: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconMap: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />,
  error: <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />,
  warning: <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />,
  info: <Info className="h-5 w-5 shrink-0 text-sky-400" />,
};

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {
  showIcon?: boolean;
}

const Toast = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, variant, showIcon = true, children, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  >
    {showIcon && variant && variant !== 'default' && iconMap[variant]}
    <div className="flex-1">{children}</div>
  </ToastPrimitive.Root>
));
Toast.displayName = 'Toast';

const ToastAction = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-transparent px-3 text-sm font-medium transition-colors',
      'hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950',
      'disabled:pointer-events-none disabled:opacity-50',
      'group-[.border-emerald-500\\/30]:border-emerald-500/30 group-[.border-emerald-500\\/30]:hover:bg-emerald-500/20',
      'group-[.border-red-500\\/30]:border-red-500/30 group-[.border-red-500\\/30]:hover:bg-red-500/20',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = 'ToastAction';

const ToastClose = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-zinc-400 opacity-0 transition-opacity',
      'hover:text-zinc-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500',
      'group-hover:opacity-100',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
));
ToastClose.displayName = 'ToastClose';

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
));
ToastTitle.displayName = 'ToastTitle';

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-sm opacity-80', className)}
    {...props}
  />
));
ToastDescription.displayName = 'ToastDescription';

// --- Toast hook and context for imperative usage ---

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: React.ReactNode;
}

type ToastActionType =
  | { type: 'ADD'; toast: ToastMessage }
  | { type: 'REMOVE'; id: string }
  | { type: 'CLEAR' };

interface ToastState {
  toasts: ToastMessage[];
}

function toastReducer(state: ToastState, action: ToastActionType): ToastState {
  switch (action.type) {
    case 'ADD':
      return { toasts: [...state.toasts, action.toast] };
    case 'REMOVE':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'CLEAR':
      return { toasts: [] };
    default:
      return state;
  }
}

let toastCount = 0;
function genId(): string {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return toastCount.toString(36) + Date.now().toString(36);
}

type ToastDispatch = (action: ToastActionType) => void;

const ToastDispatchContext = React.createContext<ToastDispatch | null>(null);

function useToastDispatch(): ToastDispatch {
  const dispatch = React.useContext(ToastDispatchContext);
  if (!dispatch) {
    throw new Error('useToast must be used within a Toaster');
  }
  return dispatch;
}

interface UseToastReturn {
  toast: (opts: Omit<ToastMessage, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

function useToast(): UseToastReturn {
  const dispatch = useToastDispatch();

  const toast = React.useCallback(
    (opts: Omit<ToastMessage, 'id'>) => {
      const id = genId();
      dispatch({ type: 'ADD', toast: { id, ...opts } });
      return id;
    },
    [dispatch]
  );

  const dismiss = React.useCallback(
    (id: string) => dispatch({ type: 'REMOVE', id }),
    [dispatch]
  );

  const dismissAll = React.useCallback(
    () => dispatch({ type: 'CLEAR' }),
    [dispatch]
  );

  return { toast, dismiss, dismissAll };
}

// --- Toaster component (place once at app root) ---

const DEFAULT_DURATION = 5000;

function Toaster({ children }: { children?: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(toastReducer, { toasts: [] });

  return (
    <ToastDispatchContext.Provider value={dispatch}>
      {children}
      <ToastProvider swipeDirection="right">
        {state.toasts.map(({ id, title, description, variant, duration, action }) => (
          <Toast
            key={id}
            variant={variant}
            duration={duration ?? DEFAULT_DURATION}
            onOpenChange={(open) => {
              if (!open) dispatch({ type: 'REMOVE', id });
            }}
          >
            <div className="flex flex-col gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastDispatchContext.Provider>
  );
}
Toaster.displayName = 'Toaster';

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastAction,
  ToastClose,
  ToastTitle,
  ToastDescription,
  toastVariants,
  Toaster,
  useToast,
};

export type { ToastMessage, ToastVariant };
