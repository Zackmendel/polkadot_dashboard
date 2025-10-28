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
      className="mt-18 rounded-2xl border border-border bg-surface p-6 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 id="transactions-heading" className="text-2xl font-semibold text-foreground">
            Transaction history
          </h2>
          <p id="transactions-description" className="mt-1 text-sm text-foreground-muted">
            Latest transfers and extrinsic calls recorded for this wallet.
          </p>
          {lastUpdated && (
            <p className="mt-2 text-xs text-foreground-subtle" aria-live="polite">
              Last updated {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => loadTransactions(true)}
          className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors duration-200 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
          <p role="status" className="text-sm text-foreground-muted">
            Loading transaction history…
          </p>
        ) : error ? (
          <p role="alert" className="text-sm font-medium text-error">
            {error}
          </p>
        ) : renderedTransactions.length === 0 ? (
          <p className="text-sm text-foreground-muted">No transaction history found for this address.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/60" aria-label="Recent transactions">
              <thead className="bg-surface-subtle">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                    Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                    Block
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                    Amount (DOT)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {renderedTransactions.map((tx) => {
                  const truncatedHash = `${tx.hash.substring(0, 6)}…${tx.hash.substring(tx.hash.length - 6)}`;
                  const amount = formatAmount(tx.amount);
                  const statusClasses = tx.success
                    ? 'bg-success/20 text-success'
                    : 'bg-error/20 text-error';

                  return (
                    <tr key={tx.hash} className="hover:bg-surface-subtle/70">
                      <td className="px-6 py-4 text-sm text-foreground">
                        <span className="font-mono" aria-label={`Transaction hash ${tx.hash}`}>
                          {truncatedHash}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{tx.block_num}</td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {new Date(tx.block_timestamp * 1000).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {`${tx.module}.${tx.call_module_function}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{amount}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>
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
