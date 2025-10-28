import React, { useCallback } from 'react';
import LoadableCard from './LoadableCard';
import TransactionsSkeleton from './skeletons/TransactionsSkeleton';
import { useTransactions } from '../hooks/useTransactions';
import TransactionsCard from './cards/TransactionsCard';
import { useToast } from './toast/ToastProvider';

interface TransactionHistoryProps {
  address: string;
}

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
      <TransactionsCard transactions={transactions} />
    </LoadableCard>
  );
};

export default TransactionHistory;
