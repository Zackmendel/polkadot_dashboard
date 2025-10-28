import { useCallback, useMemo } from 'react';
import { fetchSubscanData } from '../utils/subscanApi';
import { useLoadableResource } from './useLoadableResource';

export interface Transaction {
  hash: string;
  block_num: number;
  block_timestamp: number;
  module: string;
  call_module_function: string;
  fee: string;
  from_account_id: string;
  to_account_id: string;
  amount: string;
  success: boolean;
}

interface TransactionHistoryData {
  count: number;
  list: Transaction[];
}

export const useTransactions = (address: string | null | undefined) => {
  const initialData = useMemo<Transaction[]>(() => [], []);

  const fetcher = useCallback(async () => {
    if (!address) {
      return initialData;
    }

    const response = await fetchSubscanData<TransactionHistoryData>('account/transfer', {
      address,
      row: 25,
      page: 0,
    });

    if (!response) {
      throw new Error('Failed to fetch transaction history.');
    }

    return response.data?.list ?? [];
  }, [address, initialData]);

  return useLoadableResource<Transaction[]>({
    key: address ?? null,
    fetcher,
    initialData,
    getIsEmpty: (data) => data.length === 0,
  });
};
