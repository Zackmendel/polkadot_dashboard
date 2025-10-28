import React, { useCallback, useMemo } from 'react';
import LoadableCard from './LoadableCard';
import BalanceSkeleton from './skeletons/BalanceSkeleton';
import { useSubscanBalances, Token } from '../hooks/useSubscanBalances';
import { useToast } from './toast/ToastProvider';
import TokenInfoCard from './cards/TokenInfoCard';
import WalletBalanceCard from './cards/WalletBalanceCard';
import UsdValueCard from './cards/UsdValueCard';
import { useDotPrice } from '../hooks/useDotPrice';

interface BalanceDisplayProps {
  address: string;
}

const NETWORK_NAME = 'Polkadot Relay Chain';
const NETWORK_ICON = '🔴';

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ address }) => {
  const { toast } = useToast();
  const { data: balances, status, error, refresh, isRefreshing, lastUpdated } = useSubscanBalances(address);
  const {
    data: dotPrice,
    status: priceStatus,
    refresh: refreshDotPrice,
    isRefreshing: isPriceRefreshing,
    lastUpdated: priceLastUpdated,
  } = useDotPrice();

  const primaryToken = useMemo<Token | null>(() => {
    if (!balances.length) {
      return null;
    }

    const dotToken = balances.find((token) => token.symbol === 'DOT');
    return dotToken ?? balances[0];
  }, [balances]);

  const decimals = primaryToken?.decimals ?? 10;
  const symbol = primaryToken?.symbol ?? 'DOT';
  const assetCount = balances.length;

  const handleRefresh = useCallback(async () => {
    const [balancesResult, priceResult] = await Promise.all([
      refresh({ force: true }),
      refreshDotPrice({ force: true }),
    ]);

    if (balancesResult.status === 'error') {
      toast.error('Unable to refresh balances', 'We could not load the latest balances. Please try again.');
      return;
    }

    toast.success(
      'Portfolio refreshed',
      balancesResult.data.length > 0
        ? 'Token balances are up to date.'
        : 'No balances were returned for this address.',
    );

    if (priceResult.status === 'error') {
      toast.info('DOT price unavailable', 'Using the most recent cached price where possible.');
    }
  }, [refresh, refreshDotPrice, toast]);

  return (
    <LoadableCard
      id="portfolio"
      heading="Cross-parachain portfolio"
      description="Token balances and distribution across the Polkadot ecosystem."
      status={status}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing || isPriceRefreshing}
      skeleton={<BalanceSkeleton />}
      empty={<p className="text-sm text-foreground-muted">No balances found for this address.</p>}
      contentClassName="mt-6 space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TokenInfoCard
          networkName={NETWORK_NAME}
          tokenSymbol={symbol}
          decimals={decimals}
          assetCount={assetCount}
          chainIcon={NETWORK_ICON}
        />
        <WalletBalanceCard tokens={balances} />
        <UsdValueCard
          tokens={balances}
          dotPrice={dotPrice}
          priceStatus={priceStatus}
          priceUpdatedAt={priceLastUpdated}
        />
      </div>
    </LoadableCard>
  );
};

export default BalanceDisplay;
