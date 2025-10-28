import React, { useCallback, useEffect, useState } from 'react';
import { fetchPolkassemblyData } from '../utils/polkassemblyApi';
import { useToast } from './toast/ToastProvider';

interface UserActivity {
  id: number;
  type: string;
  created_at: string;
  details: {
    proposal_id?: number;
    motion_id?: number;
    referendum_index?: number;
    comment_id?: number;
    title?: string;
    content?: string;
  };
}

interface PolkassemblyUserActivities {
  activities: UserActivity[];
  totalCount: number;
}

interface GovernanceParticipationProps {
  address: string;
}

const GovernanceParticipation: React.FC<GovernanceParticipationProps> = ({ address }) => {
  const { toast } = useToast();
  const [governanceData, setGovernanceData] = useState<PolkassemblyUserActivities | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const loadGovernanceData = useCallback(
    async (announce: boolean) => {
      if (!address) {
        return false;
      }

      setError(null);

      if (announce) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetchPolkassemblyData<PolkassemblyUserActivities>('users/user-activities', {
          address,
          limit: 10,
          page: 0,
        });

        if (!response) {
          throw new Error('Unable to retrieve governance data');
        }

        setGovernanceData(response.data);
        setLastUpdated(Date.now());

        if (announce) {
          toast.success('Governance activity refreshed', 'Latest Polkassembly activity has been loaded.');
        }

        return true;
      } catch (err) {
        setError('Failed to fetch governance data.');

        if (announce) {
          toast.error('Unable to refresh governance activity', 'Please try again shortly.');
        }

        return false;
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [address, toast],
  );

  useEffect(() => {
    if (address) {
      loadGovernanceData(false);
    }
  }, [address, loadGovernanceData]);

  const activities = governanceData?.activities ?? [];

  return (
    <section
      id="governance"
      tabIndex={-1}
      aria-labelledby="governance-heading"
      aria-describedby="governance-description"
      aria-busy={loading || isRefreshing}
      className="mt-18 rounded-2xl border border-border bg-surface p-6 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 id="governance-heading" className="text-2xl font-semibold text-foreground">
            Governance participation
          </h2>
          <p id="governance-description" className="mt-1 text-sm text-foreground-muted">
            Recent Polkassembly activity associated with the connected address.
          </p>
          {lastUpdated && (
            <p className="mt-2 text-xs text-foreground-subtle" aria-live="polite">
              Last updated {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => loadGovernanceData(true)}
          className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors duration-200 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Refresh governance activity"
        >
          <span aria-hidden="true" className="text-base">
            ↻
          </span>
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="mt-6 space-y-4" aria-live="polite">
        {loading ? (
          <p role="status" className="text-sm text-foreground-muted">
            Loading governance participation…
          </p>
        ) : error ? (
          <p role="alert" className="text-sm font-medium text-error">
            {error}
          </p>
        ) : activities.length > 0 ? (
          <div className="space-y-4" aria-describedby="governance-description">
            <p className="text-sm text-foreground-muted">
              Total recorded activities: <strong className="font-semibold text-foreground">{governanceData?.totalCount}</strong>
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
        ) : (
          <p className="text-sm text-foreground-muted">No governance participation data found for this address.</p>
        )}
      </div>
    </section>
  );
};

export default GovernanceParticipation;
