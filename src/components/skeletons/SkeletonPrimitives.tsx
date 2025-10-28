import type { FC } from 'react';

interface SkeletonElementProps {
  className?: string;
}

export const SkeletonBlock: FC<SkeletonElementProps> = ({ className = '' }) => (
  <div aria-hidden="true" className={`animate-pulse rounded-xl bg-surface-subtle/80 ${className}`} />
);

export const SkeletonLine: FC<SkeletonElementProps> = ({ className = '' }) => (
  <div aria-hidden="true" className={`h-3 animate-pulse rounded-full bg-surface-subtle/70 ${className}`} />
);
