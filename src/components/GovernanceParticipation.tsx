import React, { useCallback } from 'react';
import LoadableCard from './LoadableCard';
import GovernanceSkeleton from './skeletons/GovernanceSkeleton';
import { useGovernanceActivities, PolkassemblyUserActivities } from '../hooks/useGovernanceActivities';
import { useToast } from './toast/ToastProvider';

interface GovernanceParticipationProps {
  address: string;
}

const GovernanceContent: React.FC<{ governanceData: PolkassemblyUserActivities }> = ({ governanceData }) => {
  const activities = governanceData.activities;

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground-muted">
        Total recorded activities:{' '}
        <strong className="font-semibold text-foreground">{governanceData.totalCount}</strong>
      </p>
      <ul className="space-y-3">
        {activities.map((activity) => (
          <li
            key={activity.id}
            className="rounded-xl border border-border bg-surface-subtle p-4 shadow-sm transition-colors duration-200 hover:bg-surface-subtle/70"
          >
            <article>
              <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <span className="text-sm font-semibold capitalize text-primary">
                  {activity.type.replace(/_/g, ' ')}
                </span>
                <time className="text-xs text-foreground-subtle" dateTime={activity.created_at}>
                  {new Date(activity.created_at).toLocaleString()}
                </time>
              </header>
              {activity.details.title && (
                <p className="mt-2 text-sm text-foreground" aria-label="Proposal title">
                  {activity.details.title}
                </p>
              )}
              {activity.details.referendum_index !== undefined && (
                <p className="mt-1 text-xs text-foreground-subtle" aria-label="Referendum number">
                  Referendum #{activity.details.referendum_index}
                </p>
              )}
              {activity.details.content && (
                <p className="mt-2 text-sm text-foreground-muted" aria-label="Activity content">
                  {activity.details.content}
                </p>
              )}
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
};

const GovernanceParticipation: React.FC<GovernanceParticipationProps> = ({ address }) => {
  const { toast } = useToast();
  const { data: governanceData, status, error, refresh, isRefreshing, lastUpdated } = useGovernanceActivities(address);

  const handleRefresh = useCallback(async () => {
    const { status: refreshedStatus } = await refresh({ force: true });

    if (refreshedStatus === 'error') {
      toast.error('Unable to refresh governance activity', 'Please try again shortly.');
      return;
    }

    toast.success(
      'Governance activity refreshed',
      refreshedStatus === 'empty'
        ? 'No governance participation data found for this address.'
        : 'Latest Polkassembly activity has been loaded.',
    );
  }, [refresh, toast]);

  return (
    <LoadableCard
      id="governance"
      heading="Governance participation"
      description="Recent Polkassembly activity associated with the connected address."
      status={status}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      skeleton={<GovernanceSkeleton />}
      empty={<p className="text-sm text-foreground-muted">No governance participation data found for this address.</p>}
      contentClassName="mt-6 space-y-4"
    >
      <GovernanceContent governanceData={governanceData} />
    </LoadableCard>
  );
};

export default GovernanceParticipation;
