import { useCallback } from 'react';
import { getStakingInfo } from '../utils/polkadotApi';
import { useLoadableResource } from './useLoadableResource';

export interface StakingInfo {
  address: string;
  bondedTo: string;
  activeStake: string;
  totalStake: string;
  unlocking: Array<{ value: string; era: number }>;
  nominatedValidators: string[];
  balance: string;
  locks: Array<{ id: string; amount: string }>;
}

export const useStakingInfo = (address: string | null | undefined) => {
  const fetcher = useCallback(async () => {
    if (!address) {
      return null;
    }

    try {
      return await getStakingInfo(address);
    } catch (error) {
      throw new Error('Failed to fetch staking data.');
    }
  }, [address]);

  return useLoadableResource<StakingInfo | null>({
    key: address ?? null,
    fetcher,
    initialData: null,
    getIsEmpty: (data) => data === null,
  });
};
