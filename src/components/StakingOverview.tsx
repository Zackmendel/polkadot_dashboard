import React, { useCallback } from 'react';
import LoadableCard from './LoadableCard';
import StakingSkeleton from './skeletons/StakingSkeleton';
import { useStakingInfo, StakingInfo } from '../hooks/useStakingInfo';
import { useToast } from './toast/ToastProvider';

interface StakingOverviewProps {
  address: string;
}

const StakingContent: React.FC<{ stakingData: StakingInfo }> = ({ stakingData }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article className="rounded-xl border border-border bg-surface-subtle p-4 text-sm text-foreground">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">Bonded to</h3>
        <p className="mt-2 font-mono text-sm">{stakingData.bondedTo || 'Not bonded'}</p>
      </article>
      <article className="rounded-xl border border-border bg-surface-subtle p-4 text-sm text-foreground">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">Active stake</h3>
        <p className="mt-2 text-base font-semibold">{stakingData.activeStake}</p>
      </article>
      <article className="rounded-xl border border-border bg-surface-subtle p-4 text-sm text-foreground">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">Total stake</h3>
        <p className="mt-2 text-base font-semibold">{stakingData.totalStake}</p>
      </article>
      <article className="rounded-xl border border-border bg-surface-subtle p-4 text-sm text-foreground">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">Balance</h3>
        <p className="mt-2 text-base font-semibold">{stakingData.balance}</p>
      </article>
      <article className="rounded-xl border border-border bg-surface-subtle p-4 text-sm text-foreground">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">Nominated validators</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm">
          {stakingData.nominatedValidators.length > 0
            ? stakingData.nominatedValidators.join(', ')
            : 'No validators nominated'}
        </p>
      </article>
      <article className="rounded-xl border border-border bg-surface-subtle p-4 text-sm text-foreground">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">Unlocking</h3>
        {stakingData.unlocking.length > 0 ? (
          <ul className="mt-2 space-y-1 text-sm">
            {stakingData.unlocking.map((unlock, index) => (
              <li key={`${unlock.era}-${index}`}>
                Value: {unlock.value}, Era: {unlock.era}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm">No funds unlocking</p>
        )}
      </article>
      <article className="rounded-xl border border-border bg-surface-subtle p-4 text-sm text-foreground">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">Locks</h3>
        {stakingData.locks.length > 0 ? (
          <ul className="mt-2 space-y-1 text-sm">
            {stakingData.locks.map((lock, index) => (
              <li key={`${lock.id}-${index}`}>
                ID: {lock.id}, Amount: {lock.amount}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm">No balance locks</p>
        )}
      </article>
    </div>
  );
};

const StakingOverview: React.FC<StakingOverviewProps> = ({ address }) => {
  const { toast } = useToast();
  const { data: stakingData, status, error, refresh, isRefreshing, lastUpdated } = useStakingInfo(address);

  const handleRefresh = useCallback(async () => {
    const { status: nextStatus } = await refresh({ force: true });

    if (nextStatus === 'error') {
      toast.error('Unable to refresh staking data', 'Please try again in a few moments.');
      return;
    }

    toast.success(
      'Staking data refreshed',
      nextStatus === 'empty' ? 'No staking data found for this address.' : 'Latest staking metrics are ready.',
    );
  }, [refresh, toast]);

  return (
    <LoadableCard
      id="staking"
      heading="Staking overview"
      description="Bonding, unlocking, and validator preferences for the connected wallet."
      status={status}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      skeleton={<StakingSkeleton />}
      empty={<p className="text-sm text-foreground-muted">No staking data found for this address.</p>}
      contentClassName="mt-6 space-y-4"
    >
      {stakingData ? <StakingContent stakingData={stakingData} /> : null}
    </LoadableCard>
  );
};

export default StakingOverview;
