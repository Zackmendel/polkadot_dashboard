import React, { useCallback, useMemo } from 'react';
import LoadableCard from './LoadableCard';
import TransactionsSkeleton from './skeletons/TransactionsSkeleton';
import { useTransactions, Transaction } from '../hooks/useTransactions';
import { useToast } from './toast/ToastProvider';

interface TransactionHistoryProps {
  address: string;
}

const formatAmount = (amount: string) => {
  const value = parseFloat(amount);
  return Number.isFinite(value) ? (value / 10 ** 10).toFixed(4) : '0.0000';
};

const TransactionsContent: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const renderedTransactions = useMemo(() => transactions.slice(0, 10), [transactions]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border/60" aria-label="Recent transactions">
        <thead className="bg-surface-subtle">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">Hash</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">Block</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">Timestamp</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">Type</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">Amount (DOT)</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {renderedTransactions.map((tx) => {
            const truncatedHash = `${tx.hash.substring(0, 6)}…${tx.hash.substring(tx.hash.length - 6)}`;
            const amount = formatAmount(tx.amount);
            const statusClasses = tx.success ? 'bg-success/20 text-success' : 'bg-error/20 text-error';

            return (
              <tr key={tx.hash} className="hover:bg-surface-subtle/70">
                <td className="px-6 py-4 text-sm text-foreground">
                  <span className="font-mono" aria-label={`Transaction hash ${tx.hash}`}>
                    {truncatedHash}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-foreground">{tx.block_num}</td>
                <td className="px-6 py-4 text-sm text-foreground">{new Date(tx.block_timestamp * 1000).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-foreground">{`${tx.module}.${tx.call_module_function}`}</td>
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
  );
};

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ address }) => {
  const { toast } = useToast();
  const { data: transactions, status, error, refresh, isRefreshing, lastUpdated } = useTransactions(address);

  const handleRefresh = useCallback(async () => {
    const { status: refreshedStatus } = await refresh({ force: true });

    if (refreshedStatus === 'error') {
      toast.error('Unable to refresh transactions', 'Please try refreshing again shortly.');
      return;
    }

    toast.success(
      'Transaction history refreshed',
      refreshedStatus === 'empty'
        ? 'No transaction history found for this address.'
        : 'Latest transfers have been retrieved.',
    );
  }, [refresh, toast]);

  return (
    <LoadableCard
      id="transactions"
      heading="Transaction history"
      description="Latest transfers and extrinsic calls recorded for this wallet."
      status={status}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      skeleton={<TransactionsSkeleton />}
      empty={<p className="text-sm text-foreground-muted">No transaction history found for this address.</p>}
      contentClassName="mt-6"
    >
      <TransactionsContent transactions={transactions} />
    </LoadableCard>
  );
};

export default TransactionHistory;
