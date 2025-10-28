import type { FC } from 'react';
import { SkeletonBlock, SkeletonLine } from './SkeletonPrimitives';

const StakingSkeleton: FC = () => (
  <div className="space-y-4" aria-hidden="true">
    <SkeletonLine className="w-32" />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonBlock key={`staking-skeleton-${index}`} className="h-32" />
      ))}
    </div>
  </div>
);

export default StakingSkeleton;
