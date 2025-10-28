import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchSubscanData } from '../utils/subscanApi';
import { useToast } from './toast/ToastProvider';

interface Transaction {
  hash: string;
  block_num: number;
  block_timestamp: number;
  module: string;
  call_module_function: string;
  fee: string;
  from_account_id: string;
  to_account_id: string;
  amount: string;
  success: boolean;
}

interface TransactionHistoryData {
  count: number;
  list: Transaction[];
}

interface TransactionHistoryProps {
  address: string;
}

const formatAmount = (amount: string) => {
  const value = parseFloat(amount);
  return Number.isFinite(value) ? (value / 10 ** 10).toFixed(4) : '0.0000';
};

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ address }) => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const loadTransactions = useCallback(
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
        const response = await fetchSubscanData<TransactionHistoryData>('account/transfer', {
          address,
          row: 10,
          page: 0,
        });

        if (!response) {
          throw new Error('Unable to load transaction history');
        }

        setTransactions(response.data?.list ?? []);
        setLastUpdated(Date.now());

        if (announce) {
          toast.success('Transaction history refreshed', 'Latest transfers have been retrieved.');
        }

        return true;
      } catch (err) {
        setError('Failed to fetch transaction history.');

        if (announce) {
          toast.error('Unable to refresh transactions', 'Please try refreshing again shortly.');
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
      loadTransactions(false);
    }
  }, [address, loadTransactions]);

  const renderedTransactions = useMemo(() => transactions.slice(0, 10), [transactions]);

  return (
    <section
      id="transactions"
      tabIndex={-1}
      aria-labelledby="transactions-heading"
      aria-describedby="transactions-description"
      aria-busy={loading || isRefreshing}
      className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 id="transactions-heading" className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Transaction history
          </h2>
          <p id="transactions-description" className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Latest transfers and extrinsic calls recorded for this wallet.
          </p>
          {lastUpdated && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
              Last updated {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => loadTransactions(true)}
          className="inline-flex items-center gap-2 self-start rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          aria-label="Refresh transaction history"
        >
          <span aria-hidden="true" className="text-base">
            ↻
          </span>
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="mt-6" aria-live="polite">
        {loading ? (
          <p role="status" className="text-sm text-slate-600 dark:text-slate-300">
            Loading transaction history…
          </p>
        ) : error ? (
          <p role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : renderedTransactions.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No transaction history found for this address.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" aria-label="Recent transactions">
              <thead className="bg-slate-100 dark:bg-slate-800/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Block
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Amount (DOT)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {renderedTransactions.map((tx) => {
                  const truncatedHash = `${tx.hash.substring(0, 6)}…${tx.hash.substring(tx.hash.length - 6)}`;
                  const amount = formatAmount(tx.amount);
                  const statusClasses = tx.success
                    ? 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-200'
                    : 'bg-rose-500/15 text-rose-600 dark:bg-rose-400/20 dark:text-rose-200';

                  return (
                    <tr key={tx.hash} className="hover:bg-slate-100/70 dark:hover:bg-slate-800/60">
                      <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">
                        <span className="font-mono" aria-label={`Transaction hash ${tx.hash}`}>
                          {truncatedHash}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">{tx.block_num}</td>
                      <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">
                        {new Date(tx.block_timestamp * 1000).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">
                        {`${tx.module}.${tx.call_module_function}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">{amount}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
                        >
                          {tx.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default TransactionHistory;
