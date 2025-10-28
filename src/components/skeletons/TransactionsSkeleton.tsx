import type { FC } from 'react';
import { SkeletonBlock, SkeletonLine } from './SkeletonPrimitives';

const TransactionsSkeleton: FC = () => (
  <div className="space-y-4" aria-hidden="true">
    <SkeletonLine className="w-48" />
    <div className="space-y-2 rounded-xl border border-border/60 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonBlock key={`transaction-skeleton-${index}`} className="h-12" />
      ))}
    </div>
  </div>
);

export default TransactionsSkeleton;
