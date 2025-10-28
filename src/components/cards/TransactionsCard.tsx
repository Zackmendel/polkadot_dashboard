import React, { useEffect, useMemo, useState } from 'react';
import Card, { CardMetadataItem, StatusBadge } from './Card';
import type { Transaction } from '../../hooks/useTransactions';
import { formatTimestamp, formatTokenAmount, truncateMiddle } from '../../utils/formatters';

interface TransactionsCardProps {
  transactions: Transaction[];
  pageSize?: number;
}

const TRANSACTION_DECIMALS = 10;

const TransactionsCard: React.FC<TransactionsCardProps> = ({ transactions, pageSize = 10 }) => {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pageSize, transactions]);

  const visibleTransactions = useMemo(
    () => transactions.slice(0, visibleCount),
    [transactions, visibleCount],
  );

  const hasMore = visibleCount < transactions.length;

  const metadata: CardMetadataItem[] = [
    {
      label: 'Fetched transfers',
      value: transactions.length,
    },
    {
      label: 'Displaying',
      value: visibleTransactions.length,
    },
  ];

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + pageSize, transactions.length));
  };

  return (
    <Card
      title="Transaction history"
      description="Latest transfers and extrinsics recently recorded for the wallet."
      metadata={metadata}
      className="border-border/70 bg-surface-subtle shadow-none"
      contentClassName="mt-4 space-y-4"
    >
      {visibleTransactions.length > 0 ? (
        <ul className="space-y-3">
          {visibleTransactions.map((transaction) => (
            <li
              key={transaction.hash}
              className="rounded-xl border border-border/60 bg-surface p-4 shadow-sm"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Hash</p>
                  <p className="font-mono text-sm text-foreground" aria-label={`Transaction hash ${transaction.hash}`}>
                    {truncateMiddle(transaction.hash, 8)}
                  </p>
                </div>
                <StatusBadge label={transaction.success ? 'Success' : 'Failed'} tone={transaction.success ? 'success' : 'danger'} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Type</p>
                  <p className="text-sm text-foreground">{`${transaction.module}.${transaction.call_module_function}`}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Block</p>
                  <p className="text-sm text-foreground">
                    #{transaction.block_num.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Amount (DOT)</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatTokenAmount(transaction.amount, TRANSACTION_DECIMALS, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Timestamp</p>
                  <time className="text-sm text-foreground" dateTime={new Date(transaction.block_timestamp * 1000).toISOString()}>
                    {formatTimestamp(transaction.block_timestamp)}
                  </time>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-foreground-muted">No transactions available for this page.</p>
      )}

      {hasMore ? (
        <button
          type="button"
          onClick={handleLoadMore}
          className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Load more
        </button>
      ) : null}
    </Card>
  );
};

export default TransactionsCard;
