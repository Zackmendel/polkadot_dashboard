import React, { useCallback, useId } from 'react';
import type { LoadStatus } from '../hooks/useLoadableResource';

interface LoadableCardProps {
  id: string;
  heading: string;
  description: string;
  status: LoadStatus;
  error?: string | null;
  lastUpdated?: number | null;
  isRefreshing?: boolean;
  onRefresh?: () => void | Promise<unknown>;
  refreshLabel?: string;
  skeleton: React.ReactNode;
  empty: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  headerActions?: React.ReactNode;
}

const defaultCardClasses =
  'mt-18 rounded-2xl border border-border bg-surface p-6 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background';

const LoadableCard: React.FC<LoadableCardProps> = ({
  id,
  heading,
  description,
  status,
  error,
  lastUpdated,
  isRefreshing = false,
  onRefresh,
  refreshLabel = 'Refresh',
  skeleton,
  empty,
  children,
  className,
  contentClassName,
  headerActions,
}) => {
  const instanceId = useId();
  const headingId = `${id}-heading-${instanceId}`;
  const descriptionId = `${id}-description-${instanceId}`;

  const handleRefresh = useCallback(() => {
    if (!onRefresh) {
      return;
    }

    try {
      const result = onRefresh();
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        (result as Promise<unknown>).catch(() => undefined);
      }
    } catch (err) {
      // no-op: refresh errors are surfaced via component state
    }
  }, [onRefresh]);

  const isLoading = status === 'loading' || status === 'idle';
  const showError = status === 'error';
  const showEmpty = status === 'empty';
  const showContent = status === 'success';

  const sectionClasses = className ? `${defaultCardClasses} ${className}` : defaultCardClasses;
  const contentClasses = contentClassName ?? 'mt-6 space-y-6';
  const busy = isLoading || isRefreshing;

  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      aria-busy={busy}
      className={sectionClasses}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 id={headingId} className="text-2xl font-semibold text-foreground">
            {heading}
          </h2>
          <p id={descriptionId} className="mt-1 text-sm text-foreground-muted">
            {description}
          </p>
          {lastUpdated ? (
            <p className="mt-2 text-xs text-foreground-subtle" aria-live="polite">
              Last updated {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {headerActions}
          {onRefresh ? (
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors duration-200 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`Refresh ${heading.toLowerCase()}`}
              disabled={busy}
            >
              <span aria-hidden="true" className="text-base">
                ↻
              </span>
              {isRefreshing ? 'Refreshing…' : refreshLabel}
            </button>
          ) : null}
        </div>
      </div>

      <div className={contentClasses} aria-live="polite">
        {isLoading ? (
          <div>{skeleton}</div>
        ) : showError ? (
          <div className="space-y-3 rounded-xl border border-error/40 bg-error/10 p-4" role="alert">
            <p className="text-sm font-semibold text-error">Unable to load this section.</p>
            {error ? <p className="text-sm text-error/80">{error}</p> : null}
            {onRefresh ? (
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center justify-center rounded-full border border-error bg-error px-4 py-2 text-sm font-semibold text-error-foreground shadow-sm transition-colors duration-200 hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : showEmpty ? (
          empty
        ) : showContent ? (
          children
        ) : null}
      </div>
    </section>
  );
};

export default LoadableCard;
