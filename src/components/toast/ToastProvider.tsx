import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastIntent = 'success' | 'error' | 'info';

interface ToastInput {
  id?: string;
  title: string;
  description?: string;
  intent?: ToastIntent;
  duration?: number;
}

interface ToastRecord {
  id: string;
  title: string;
  description?: string;
  intent: ToastIntent;
  duration: number;
}

interface ToastContextValue {
  toast: {
    success: (title: string, description?: string, options?: Omit<ToastInput, 'title' | 'description' | 'intent'>) => string;
    error: (title: string, description?: string, options?: Omit<ToastInput, 'title' | 'description' | 'intent'>) => string;
    info: (title: string, description?: string, options?: Omit<ToastInput, 'title' | 'description' | 'intent'>) => string;
    custom: (input: ToastInput) => string;
  };
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 6000;

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const variantStyles: Record<ToastIntent, { container: string; description: string; close: string }> = {
  success: {
    container: 'border-success/35 bg-success/15 text-success shadow-lg',
    description: 'text-success/80',
    close: 'bg-success/10 text-success hover:bg-success/20',
  },
  error: {
    container: 'border-error/35 bg-error/15 text-error shadow-lg',
    description: 'text-error/80',
    close: 'bg-error/10 text-error hover:bg-error/20',
  },
  info: {
    container: 'border-accent/35 bg-surface text-foreground shadow-lg',
    description: 'text-foreground-muted',
    close: 'bg-accent/10 text-accent hover:bg-accent/20',
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const toastRootRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<Map<string, { timeoutId: number; start: number; remaining: number }>>(new Map());

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const existingRoot = document.getElementById('toast-root');
    let root: HTMLDivElement;
    let shouldRemoveRoot = false;

    if (existingRoot) {
      root = existingRoot as HTMLDivElement;
      toastRootRef.current = root;
    } else {
      root = document.createElement('div');
      root.id = 'toast-root';
      root.className = 'pointer-events-none fixed top-4 right-4 z-50 flex max-w-sm flex-col gap-3';
      document.body.appendChild(root);
      toastRootRef.current = root;
      shouldRemoveRoot = true;
    }

    return () => {
      timers.current.forEach(({ timeoutId }) => window.clearTimeout(timeoutId));
      timers.current.clear();

      if (shouldRemoveRoot) {
        root.remove();
      }
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer.timeoutId);
      timers.current.delete(id);
    }
  }, []);

  const scheduleRemoval = useCallback(
    (id: string, duration: number) => {
      if (duration === Infinity) {
        return;
      }

      const timeoutId = window.setTimeout(() => {
        removeToast(id);
      }, duration);

      timers.current.set(id, {
        timeoutId,
        start: Date.now(),
        remaining: duration,
      });
    },
    [removeToast],
  );

  const addToast = useCallback(
    (input: ToastInput) => {
      const id = input.id ?? generateId();
      const intent = input.intent ?? 'info';
      const duration = input.duration ?? DEFAULT_DURATION;

      const record: ToastRecord = {
        id,
        title: input.title,
        description: input.description,
        intent,
        duration,
      };

      setToasts((prev) => [...prev, record]);
      scheduleRemoval(id, duration);

      return id;
    },
    [scheduleRemoval],
  );

  const pauseTimer = useCallback((id: string) => {
    const timer = timers.current.get(id);

    if (!timer) {
      return;
    }

    window.clearTimeout(timer.timeoutId);

    const elapsed = Date.now() - timer.start;
    const remaining = Math.max(timer.remaining - elapsed, 0);

    timers.current.set(id, {
      timeoutId: 0,
      start: Date.now(),
      remaining,
    });
  }, []);

  const resumeTimer = useCallback(
    (id: string) => {
      const timer = timers.current.get(id);

      if (!timer) {
        return;
      }

      if (timer.remaining <= 0) {
        removeToast(id);
        return;
      }

      scheduleRemoval(id, timer.remaining);
    },
    [removeToast, scheduleRemoval],
  );

  const contextValue = useMemo<ToastContextValue>(() => ({
    toast: {
      success: (title, description, options) =>
        addToast({
          ...options,
          title,
          description,
          intent: 'success',
        }),
      error: (title, description, options) =>
        addToast({
          ...options,
          title,
          description,
          intent: 'error',
        }),
      info: (title, description, options) =>
        addToast({
          ...options,
          title,
          description,
          intent: 'info',
        }),
      custom: (input) => addToast(input),
    },
    dismiss: removeToast,
  }), [addToast, removeToast]);

  const renderedToasts = useMemo(() => {
    if (!toastRootRef.current) {
      return null;
    }

    return createPortal(
      <div
        role="region"
        aria-live="polite"
        aria-relevant="additions text"
        className="flex flex-col gap-3"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.intent === 'error' ? 'alert' : 'status'}
            aria-live={toast.intent === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
            className={`pointer-events-auto overflow-hidden rounded-xl border px-4 py-3 transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${variantStyles[toast.intent].container}`}
            onMouseEnter={() => pauseTimer(toast.id)}
            onMouseLeave={() => resumeTimer(toast.id)}
            onFocusCapture={() => pauseTimer(toast.id)}
            onBlurCapture={() => resumeTimer(toast.id)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description && (
                  <p className={`mt-1 text-sm ${variantStyles[toast.intent].description}`}>
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                className={`inline-flex shrink-0 items-center justify-center rounded-full p-1 text-xs transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background ${variantStyles[toast.intent].close}`}
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </div>
        ))}
      </div>,
      toastRootRef.current,
    );
  }, [pauseTimer, removeToast, resumeTimer, toasts]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {renderedToasts}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};
