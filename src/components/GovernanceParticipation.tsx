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
      className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 id="governance-heading" className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Governance participation
          </h2>
          <p id="governance-description" className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Recent Polkassembly activity associated with the connected address.
          </p>
          {lastUpdated && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
              Last updated {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => loadGovernanceData(true)}
          className="inline-flex items-center gap-2 self-start rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
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
          <p role="status" className="text-sm text-slate-600 dark:text-slate-300">
            Loading governance participation…
          </p>
        ) : error ? (
          <p role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : activities.length > 0 ? (
          <div className="space-y-4" aria-describedby="governance-description">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Total recorded activities: <strong className="font-semibold text-slate-900 dark:text-slate-100">{governanceData?.totalCount}</strong>
            </p>
            <ul className="space-y-3">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:bg-slate-100/70 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60"
                >
                  <article>
                    <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                      <span className="text-sm font-semibold capitalize text-sky-600 dark:text-sky-300">
                        {activity.type.replace(/_/g, ' ')}
                      </span>
                      <time className="text-xs text-slate-500 dark:text-slate-400" dateTime={activity.created_at}>
                        {new Date(activity.created_at).toLocaleString()}
                      </time>
                    </header>
                    {activity.details.title && (
                      <p className="mt-2 text-sm text-slate-800 dark:text-slate-200" aria-label="Proposal title">
                        {activity.details.title}
                      </p>
                    )}
                    {activity.details.referendum_index !== undefined && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400" aria-label="Referendum number">
                        Referendum #{activity.details.referendum_index}
                      </p>
                    )}
                    {activity.details.content && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300" aria-label="Activity content">
                        {activity.details.content}
                      </p>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No governance participation data found for this address.
          </p>
        )}
      </div>
    </section>
  );
};

export default GovernanceParticipation;
