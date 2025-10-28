import React, { useMemo } from 'react';
import Card, { CardMetadataItem } from './Card';
import type { Token } from '../../hooks/useSubscanBalances';
import { convertToUnitBalance, formatNumber, formatPlanck, formatTokenAmount } from '../../utils/formatters';

interface WalletBalanceCardProps {
  tokens: Token[];
}

type EnrichedTokenBalance = Token & {
  units: number;
  formattedUnits: string;
  formattedPlanck: string;
};

const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({ tokens }) => {
  const enriched = useMemo<EnrichedTokenBalance[]>(
    () =>
      tokens
        .map((token) => {
          const units = convertToUnitBalance(token.balance, token.decimals);

          return {
            ...token,
            units,
            formattedUnits: formatTokenAmount(token.balance, token.decimals, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            }),
            formattedPlanck: formatPlanck(token.balance),
          };
        })
        .sort((a, b) => b.units - a.units),
    [tokens],
  );

  const totalUnits = useMemo(
    () => enriched.reduce((sum, token) => sum + token.units, 0),
    [enriched],
  );

  const primarySymbol = enriched[0]?.symbol ?? 'DOT';

  const metadata: CardMetadataItem[] = [
    {
      label: 'Tokens tracked',
      value: tokens.length,
    },
    {
      label: 'Total units',
      value: `${formatNumber(totalUnits, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${primarySymbol}`,
    },
    {
      label: 'Dominant asset',
      value: primarySymbol,
    },
  ];

  return (
    <Card
      title="Wallet balance"
      description="Balances converted from planck to human-readable units."
      metadata={metadata}
      className="border-border/70 bg-surface-subtle shadow-none"
      contentClassName="mt-4 space-y-4"
    >
      {enriched.map((token) => (
        <div
          key={token.asset_id}
          className="rounded-xl border border-border/60 bg-surface p-4 shadow-sm transition-colors duration-200 hover:bg-surface-hover/70"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{token.symbol}</p>
              <p className="text-xs text-foreground-subtle">Decimals: {token.decimals}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-foreground">
                {token.formattedUnits} <span className="text-sm text-foreground-muted">{token.symbol}</span>
              </p>
              <p className="text-xs text-foreground-muted">{token.formattedPlanck} planck</p>
            </div>
          </div>
        </div>
      ))}
      <p className="text-xs text-foreground-muted">
        Balances are sourced from Subscan and converted using reported decimal precision. Planck values remain available for
        reconciliation with on-chain data.
      </p>
    </Card>
  );
};

export default WalletBalanceCard;
