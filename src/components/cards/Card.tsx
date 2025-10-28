import React from 'react';

export type CardStatusTone = 'default' | 'info' | 'success' | 'warning' | 'danger';

export interface CardStatusBadge {
  label: string;
  tone?: CardStatusTone;
}

export interface CardMetadataItem {
  label: string;
  value: React.ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  title: string;
  description?: React.ReactNode;
  metadata?: CardMetadataItem[];
  statusBadges?: CardStatusBadge[];
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
  children: React.ReactNode;
}

const toneClasses: Record<CardStatusTone, string> = {
  default: 'bg-border/30 text-foreground-muted',
  info: 'bg-primary/15 text-primary',
  success: 'bg-success/20 text-success',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  danger: 'bg-error/20 text-error',
};

const baseCardClasses =
  'rounded-2xl border border-border bg-surface p-6 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background';

const composeClassName = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const StatusBadge: React.FC<CardStatusBadge> = ({ label, tone = 'default' }) => (
  <span className={composeClassName('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize', toneClasses[tone])}>
    {label}
  </span>
);

interface CardHeaderProps {
  title: string;
  description?: React.ReactNode;
  metadata?: CardMetadataItem[];
  statusBadges?: CardStatusBadge[];
  actions?: React.ReactNode;
  headingId?: string;
  descriptionId?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  description,
  metadata,
  statusBadges,
  actions,
  headingId,
  descriptionId,
}) => (
  <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
    <div className="space-y-4">
      <div>
        <h3 id={headingId} className="text-lg font-semibold text-foreground">
          {title}
        </h3>
        {description ? (
          <p id={descriptionId} className="mt-1 text-sm text-foreground-muted">
            {description}
          </p>
        ) : null}
      </div>
      {metadata && metadata.length > 0 ? (
        <dl className="grid gap-3 sm:grid-cols-2">
          {metadata.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5 text-sm">
              <dt className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">{label}</dt>
              <dd className="text-sm text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
    <div className="flex flex-col items-end gap-3 sm:items-stretch">
      {statusBadges && statusBadges.length > 0 ? (
        <div className="flex flex-wrap justify-end gap-2">
          {statusBadges.map((badge) => (
            <StatusBadge key={`${badge.label}-${badge.tone ?? 'default'}`} {...badge} />
          ))}
        </div>
      ) : null}
      {actions}
    </div>
  </header>
);

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardContent: React.FC<SectionProps> = ({ children, className, ...rest }) => (
  <div className={composeClassName('mt-6 space-y-4', className)} {...rest}>
    {children}
  </div>
);

const CardFooter: React.FC<SectionProps> = ({ children, className, ...rest }) => (
  <footer className={composeClassName('mt-6 border-t border-border/70 pt-4 text-sm text-foreground-muted', className)} {...rest}>
    {children}
  </footer>
);

const Card: React.FC<CardProps> = ({
  id,
  title,
  description,
  metadata,
  statusBadges,
  actions,
  footer,
  children,
  className,
  contentClassName,
  ...rest
}) => {
  const headingId = id ? `${id}-card-heading` : undefined;
  const descriptionId = description ? `${id}-card-description` : undefined;
  const ariaDescribedBy = descriptionId ?? undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      aria-describedby={ariaDescribedBy}
      className={composeClassName(baseCardClasses, className)}
      {...rest}
    >
      <CardHeader
        title={title}
        description={description}
        metadata={metadata}
        statusBadges={statusBadges}
        actions={actions}
        headingId={headingId}
        descriptionId={descriptionId}
      />
      <CardContent className={contentClassName}>{children}</CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </section>
  );
};

export { CardHeader, CardContent, CardFooter, StatusBadge };
export default Card;
