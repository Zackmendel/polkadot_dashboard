import React, { useCallback, useEffect, useState } from 'react';
import { getStakingInfo } from '../utils/polkadotApi';
import { useToast } from './toast/ToastProvider';

interface StakingInfo {
  address: string;
  bondedTo: string;
  activeStake: string;
  totalStake: string;
  unlocking: Array<{ value: string; era: number }>;
  nominatedValidators: string[];
  balance: string;
  locks: Array<{ id: string; amount: string }>;
}

interface StakingOverviewProps {
  address: string;
}

const StakingOverview: React.FC<StakingOverviewProps> = ({ address }) => {
  const { toast } = useToast();
  const [stakingData, setStakingData] = useState<StakingInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const loadStakingInfo = useCallback(
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
        const data = await getStakingInfo(address);
        setStakingData(data);
        setLastUpdated(Date.now());

        if (announce) {
          toast.success('Staking data refreshed', 'Latest staking metrics are ready.');
        }

        return true;
      } catch (err) {
        setError('Failed to fetch staking data.');

        if (announce) {
          toast.error('Unable to refresh staking data', 'Please try again in a few moments.');
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
      loadStakingInfo(false);
    }
  }, [address, loadStakingInfo]);

  return (
    <section
      id="staking"
      tabIndex={-1}
      aria-labelledby="staking-heading"
      aria-describedby="staking-description"
      aria-busy={loading || isRefreshing}
      className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 id="staking-heading" className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Staking overview
          </h2>
          <p id="staking-description" className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Bonding, unlocking, and validator preferences for the connected wallet.
          </p>
          {lastUpdated && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
              Last updated {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => loadStakingInfo(true)}
          className="inline-flex items-center gap-2 self-start rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          aria-label="Refresh staking overview"
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
            Loading staking overview…
          </p>
        ) : error ? (
          <p role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : !stakingData ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No staking data found for this address.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-describedby="staking-description">
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Bonded to
              </h3>
              <p className="mt-2 font-mono text-sm">{stakingData.bondedTo || 'Not bonded'}</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Active stake
              </h3>
              <p className="mt-2 text-base font-semibold">{stakingData.activeStake}</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Total stake
              </h3>
              <p className="mt-2 text-base font-semibold">{stakingData.totalStake}</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Balance
              </h3>
              <p className="mt-2 text-base font-semibold">{stakingData.balance}</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Nominated validators
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm">
                {stakingData.nominatedValidators.length > 0
                  ? stakingData.nominatedValidators.join(', ')
                  : 'No validators nominated'}
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Unlocking
              </h3>
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
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Locks
              </h3>
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
        )}
      </div>
    </section>
  );
};

export default StakingOverview;
