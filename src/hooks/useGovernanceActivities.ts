import { useCallback, useMemo } from 'react';
import { fetchPolkassemblyData } from '../utils/polkassemblyApi';
import { useLoadableResource } from './useLoadableResource';

export interface UserActivity {
  id: number;
  type: string;
  created_at: string;
  details: {
    proposal_id?: number;
    motion_id?: number;
    referendum_index?: number;
    comment_id?: number;
    title?: string;
    content?: string;
  };
}

export interface PolkassemblyUserActivities {
  activities: UserActivity[];
  totalCount: number;
}

export const useGovernanceActivities = (address: string | null | undefined) => {
  const initialData = useMemo<PolkassemblyUserActivities>(
    () => ({ activities: [], totalCount: 0 }),
    [],
  );

  const fetcher = useCallback(async () => {
    if (!address) {
      return initialData;
    }

    const response = await fetchPolkassemblyData<PolkassemblyUserActivities>('users/user-activities', {
      address,
      limit: 10,
      page: 0,
    });

    if (!response) {
      throw new Error('Failed to fetch governance data.');
    }

    return response.data;
  }, [address, initialData]);

  return useLoadableResource<PolkassemblyUserActivities>({
    key: address ?? null,
    fetcher,
    initialData,
    getIsEmpty: (data) => data.activities.length === 0,
  });
};
