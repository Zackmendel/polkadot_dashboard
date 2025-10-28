import type { FC } from 'react';
import { SkeletonBlock, SkeletonLine } from './SkeletonPrimitives';

const BalanceSkeleton: FC = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={`balance-skeleton-${index}`} className="rounded-2xl border border-border/60 bg-surface-subtle p-4 shadow-sm">
        <SkeletonLine className="w-2/3" />
        <div className="mt-4 space-y-3">
          <SkeletonLine className="w-1/2" />
          <SkeletonLine className="w-3/4" />
          <SkeletonBlock className="h-16" />
        </div>
      </div>
    ))}
  </div>
);

export default BalanceSkeleton;
