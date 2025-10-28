import React from 'react';
import Card, { CardMetadataItem, CardStatusBadge } from './Card';
import type { StakingInfo } from '../../hooks/useStakingInfo';

interface StakeSummaryCardProps {
  staking: StakingInfo;
}

const StakeSummaryCard: React.FC<StakeSummaryCardProps> = ({ staking }) => {
  const isBonded = staking.bondedTo && staking.bondedTo !== 'Not bonded';

  const metadata: CardMetadataItem[] = [
    {
      label: 'Bonded to',
      value: isBonded ? staking.bondedTo : 'Not bonded',
    },
    {
      label: 'Validators nominated',
      value: staking.nominatedValidators.length,
    },
    {
      label: 'Unlocking chunks',
      value: staking.unlocking.length,
    },
  ];

  const statusBadge: CardStatusBadge = isBonded
    ? { label: 'Bond active', tone: 'success' }
    : { label: 'No bonding', tone: 'warning' };

  return (
    <Card
      title="Staking metrics"
      description="Current staking position derived from the connected account."
      metadata={metadata}
      statusBadges={[statusBadge]}
      className="border-border/70 bg-surface-subtle shadow-none"
      contentClassName="mt-4 space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Active stake</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{staking.activeStake}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Total bonded</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{staking.totalStake}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Available balance</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{staking.balance}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Locks</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{staking.locks.length}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Nomination targets</p>
        {staking.nominatedValidators.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {staking.nominatedValidators.map((validator) => (
              <li
                key={validator}
                className="rounded-lg border border-border/60 bg-surface p-3 text-sm text-foreground"
              >
                {validator}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-foreground-muted">No validators nominated.</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Unlocking schedule</p>
        {staking.unlocking.length > 0 ? (
          <ul className="space-y-2 text-sm text-foreground">
            {staking.unlocking.map((unlock, index) => (
              <li
                key={`${unlock.era}-${index}`}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-surface p-3"
              >
                <span>{unlock.value}</span>
                <span className="text-xs text-foreground-muted">Era {unlock.era}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-foreground-muted">No funds waiting to unlock.</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Balance locks</p>
        {staking.locks.length > 0 ? (
          <ul className="space-y-2 text-sm text-foreground">
            {staking.locks.map((lock, index) => (
              <li
                key={`${lock.id}-${index}`}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-surface p-3"
              >
                <span>{lock.id}</span>
                <span className="text-xs text-foreground-muted">{lock.amount}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-foreground-muted">No active balance locks.</p>
        )}
      </div>
    </Card>
  );
};

export default StakeSummaryCard;
