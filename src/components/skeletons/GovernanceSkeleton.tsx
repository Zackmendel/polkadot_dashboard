import type { FC } from 'react';
import { SkeletonBlock, SkeletonLine } from './SkeletonPrimitives';

const GovernanceSkeleton: FC = () => (
  <div className="space-y-4" aria-hidden="true">
    <SkeletonLine className="w-40" />
    {Array.from({ length: 3 }).map((_, index) => (
      <SkeletonBlock key={`governance-skeleton-${index}`} className="h-24" />
    ))}
  </div>
);

export default GovernanceSkeleton;
