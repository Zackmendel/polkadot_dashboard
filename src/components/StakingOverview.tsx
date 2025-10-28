import React, { useCallback } from 'react';
import LoadableCard from './LoadableCard';
import StakingSkeleton from './skeletons/StakingSkeleton';
import { useStakingInfo } from '../hooks/useStakingInfo';
import StakeSummaryCard from './cards/StakeSummaryCard';
import { useToast } from './toast/ToastProvider';

interface StakingOverviewProps {
  address: string;
}

const StakingOverview: React.FC<StakingOverviewProps> = ({ address }) => {
  const { toast } = useToast();
  const { data: stakingData, status, error, refresh, isRefreshing, lastUpdated } = useStakingInfo(address);

  const handleRefresh = useCallback(async () => {
    const { status: nextStatus } = await refresh({ force: true });

    if (nextStatus === 'error') {
      toast.error('Unable to refresh staking data', 'Please try again in a few moments.');
      return;
    }

    toast.success(
      'Staking data refreshed',
      nextStatus === 'empty' ? 'No staking data found for this address.' : 'Latest staking metrics are ready.',
    );
  }, [refresh, toast]);

  return (
    <LoadableCard
      id="staking"
      heading="Staking overview"
      description="Bonding, unlocking, and validator preferences for the connected wallet."
      status={status}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      skeleton={<StakingSkeleton />}
      empty={<p className="text-sm text-foreground-muted">No staking data found for this address.</p>}
      contentClassName="mt-6"
    >
      {stakingData ? <StakeSummaryCard staking={stakingData} /> : null}
    </LoadableCard>
  );
};

export default StakingOverview;
