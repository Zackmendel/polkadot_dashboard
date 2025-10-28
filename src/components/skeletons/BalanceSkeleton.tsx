import type { FC } from 'react';
import { SkeletonBlock, SkeletonLine } from './SkeletonPrimitives';

const BalanceSkeleton: FC = () => (
  <div className="space-y-6" aria-hidden="true">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <SkeletonBlock className="h-24" />
      <SkeletonBlock className="h-24" />
      <SkeletonBlock className="hidden h-24 xl:block" />
    </div>
    <SkeletonBlock className="h-72" />
    <div className="space-y-3 rounded-xl border border-border/60 p-4">
      <SkeletonLine className="w-1/3" />
      <div className="space-y-2">
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-11/12" />
        <SkeletonLine className="w-10/12" />
        <SkeletonLine className="w-9/12" />
      </div>
    </div>
  </div>
);

export default BalanceSkeleton;
