import React, { useMemo } from 'react';
import Card, { CardMetadataItem, CardStatusBadge } from './Card';
import type { Token } from '../../hooks/useSubscanBalances';
import type { LoadStatus } from '../../hooks/useLoadableResource';
import {
  convertToUnitBalance,
  formatNumber,
  formatPercent,
  formatUsd,
  safeParseNumber,
} from '../../utils/formatters';

interface UsdValueCardProps {
  tokens: Token[];
  dotPrice: number;
  priceStatus: LoadStatus;
  priceUpdatedAt: number | null;
}

type TokenContribution = {
  id: string;
  symbol: string;
  usdValue: number;
  units: number;
  price: number;
};

const statusToBadge = (status: LoadStatus): CardStatusBadge => {
  switch (status) {
    case 'loading':
    case 'idle':
      return { label: 'Fetching price', tone: 'info' };
    case 'error':
      return { label: 'Price unavailable', tone: 'danger' };
    case 'empty':
      return { label: 'No price data', tone: 'warning' };
    case 'success':
    default:
      return { label: 'Price synced', tone: 'success' };
  }
};

const UsdValueCard: React.FC<UsdValueCardProps> = ({ tokens, dotPrice, priceStatus, priceUpdatedAt }) => {
  const contributions = useMemo<TokenContribution[]>(() => {
    return tokens
      .map((token) => {
        const tokenPrice = safeParseNumber(token.price_usd);
        const resolvedPrice = tokenPrice > 0 ? tokenPrice : token.symbol === 'DOT' ? dotPrice : 0;
        const units = convertToUnitBalance(token.balance, token.decimals);
        const usdValue = units * resolvedPrice;

        return {
          id: token.asset_id,
          symbol: token.symbol,
          usdValue,
          units,
          price: resolvedPrice,
        };
      })
      .filter((item) => item.units > 0)
      .sort((a, b) => b.usdValue - a.usdValue);
  }, [tokens, dotPrice]);

  const totalUsd = useMemo(
    () => contributions.reduce((sum, item) => sum + item.usdValue, 0),
    [contributions],
  );

  const tokensMissingPrice = useMemo(
    () =>
      contributions
        .filter((item) => item.price <= 0)
        .map((item) => item.symbol),
    [contributions],
  );

  const metadata: CardMetadataItem[] = [
    {
      label: 'Tracked assets',
      value: tokens.length,
    },
    {
      label: 'DOT reference price',
      value:
        dotPrice > 0
          ? formatUsd(dotPrice, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : 'Unavailable',
    },
  ];

  if (priceUpdatedAt) {
    metadata.push({
      label: 'Price updated',
      value: new Date(priceUpdatedAt).toLocaleTimeString(),
    });
  }

  return (
    <Card
      title="USD value"
      description="Aggregated value across tracked assets using live pricing when available."
      metadata={metadata}
      statusBadges={[statusToBadge(priceStatus)]}
      className="border-border/70 bg-surface-subtle shadow-none"
      contentClassName="mt-4 space-y-4"
    >
      <div>
        <p className="text-sm text-foreground-muted">Estimated portfolio value</p>
        <p className="text-3xl font-bold text-foreground">
          {formatUsd(totalUsd, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {contributions.length > 0 ? (
        <ul className="space-y-3">
          {contributions.map((token) => {
            const percentage = totalUsd > 0 ? token.usdValue / totalUsd : 0;

            return (
              <li
                key={token.id}
                className="rounded-xl border border-border/60 bg-surface p-4 shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{token.symbol}</p>
                    <p className="text-xs text-foreground-subtle">
                      {formatNumber(token.units, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}{' '}
                      {token.symbol}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatUsd(token.usdValue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-foreground-muted">{formatPercent(percentage, 1)} of portfolio</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-foreground-muted">Pricing data unavailable for the tracked assets.</p>
      )}

      {tokensMissingPrice.length > 0 ? (
        <p className="text-xs text-foreground-muted">
          Unable to price {tokensMissingPrice.length} asset
          {tokensMissingPrice.length === 1 ? '' : 's'}: {tokensMissingPrice.join(', ')}.
        </p>
      ) : null}
    </Card>
  );
};

export default UsdValueCard;
