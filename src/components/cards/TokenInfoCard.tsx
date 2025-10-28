import React from 'react';
import Card, { CardMetadataItem, CardStatusBadge } from './Card';

interface TokenInfoCardProps {
  networkName: string;
  tokenSymbol: string;
  decimals: number;
  assetCount: number;
  chainIcon?: React.ReactNode;
  statusBadge?: CardStatusBadge;
}

const DEFAULT_STATUS: CardStatusBadge = {
  label: 'Live network',
  tone: 'success',
};

const DEFAULT_ICON = '🔴';

const TokenInfoCard: React.FC<TokenInfoCardProps> = ({
  networkName,
  tokenSymbol,
  decimals,
  assetCount,
  chainIcon = DEFAULT_ICON,
  statusBadge = DEFAULT_STATUS,
}) => {
  const metadata: CardMetadataItem[] = [
    { label: 'Network', value: networkName },
    { label: 'Symbol', value: tokenSymbol },
    { label: 'Decimals', value: decimals },
    { label: 'Assets tracked', value: assetCount },
  ];

  return (
    <Card
      title="Token identity"
      description="Connected chain and native asset overview."
      metadata={metadata}
      statusBadges={[statusBadge]}
      className="border-border/70 bg-surface-subtle shadow-none"
      contentClassName="mt-4 space-y-4"
    >
      <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-surface p-4 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-2xl">
          <span aria-hidden="true">{chainIcon}</span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Primary token</p>
          <p className="text-lg font-semibold text-foreground">{tokenSymbol}</p>
          <p className="text-sm text-foreground-muted">{networkName}</p>
        </div>
      </div>
      <p className="text-sm text-foreground-muted">
        Tracker monitors <span className="font-semibold text-foreground">{assetCount}</span> asset
        {assetCount === 1 ? '' : 's'} reported by Subscan. Token decimals ensure precise planck-to-unit conversions.
      </p>
    </Card>
  );
};

export default TokenInfoCard;
