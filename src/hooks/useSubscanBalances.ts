import { useCallback, useMemo } from 'react';
import { fetchSubscanData } from '../utils/subscanApi';
import { useLoadableResource } from './useLoadableResource';

export interface Token {
  asset_id: string;
  balance: string;
  symbol: string;
  decimals: number;
  price_usd: string;
}

interface AccountTokensData {
  count: number;
  list: Token[];
  module: string[];
}

export const useSubscanBalances = (address: string | null | undefined) => {
  const initialData = useMemo<Token[]>(() => [], []);

  const fetcher = useCallback(async () => {
    if (!address) {
      return initialData;
    }

    const response = await fetchSubscanData<AccountTokensData>('account/tokens', { address });

    if (!response) {
      throw new Error('Failed to fetch balances.');
    }

    return response.data?.list ?? [];
  }, [address, initialData]);

  return useLoadableResource<Token[]>({
    key: address ?? null,
    fetcher,
    initialData,
    getIsEmpty: (data) => data.length === 0,
  });
};
