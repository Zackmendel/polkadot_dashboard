import { renderHook, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSubscanBalances } from '../useSubscanBalances';
import { useStakingInfo } from '../useStakingInfo';
import { useTransactions } from '../useTransactions';

const mockFetchSubscanData = vi.fn();
const mockGetStakingInfo = vi.fn();

vi.mock('../../utils/subscanApi', () => ({
  fetchSubscanData: mockFetchSubscanData,
}));

vi.mock('../../utils/polkadotApi', () => ({
  getStakingInfo: mockGetStakingInfo,
}));

vi.mock('../../utils/polkassemblyApi', () => ({
  fetchPolkassemblyData: vi.fn(),
}));

describe('wallet data hooks', () => {
  beforeEach(() => {
    mockFetchSubscanData.mockReset();
    mockGetStakingInfo.mockReset();
  });

  it('loads balances and exposes refresh behaviour', async () => {
    const sampleBalance = {
      asset_id: '1',
      balance: '10000000000',
      symbol: 'DOT',
      decimals: 10,
      price_usd: '6',
    };

    mockFetchSubscanData.mockResolvedValueOnce({
      data: { list: [sampleBalance], count: 1, module: [] },
    });

    const { result } = renderHook(() => useSubscanBalances('address-123'));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.error).toBeNull();

    mockFetchSubscanData.mockResolvedValueOnce({
      data: { list: [sampleBalance, { ...sampleBalance, asset_id: '2' }], count: 2, module: [] },
    });

    let outcome: any;
    await act(async () => {
      outcome = await result.current.refresh({ force: true });
    });

    expect(outcome.status).toBe('success');
    await waitFor(() => expect(result.current.data).toHaveLength(2));
  });

  it('surface errors when balance retrieval fails', async () => {
    mockFetchSubscanData.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSubscanBalances('address-error'));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('Failed to fetch balances.');
  });

  it('handles staking refresh failures gracefully', async () => {
    const stakingResult = {
      address: 'address-456',
      bondedTo: 'bonded',
      activeStake: '10 DOT',
      totalStake: '20 DOT',
      unlocking: [],
      nominatedValidators: [],
      balance: '100 DOT',
      locks: [],
    };

    mockGetStakingInfo.mockResolvedValueOnce(stakingResult);

    const { result } = renderHook(() => useStakingInfo('address-456'));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data).toEqual(stakingResult);

    mockGetStakingInfo.mockRejectedValueOnce(new Error('network down'));

    await act(async () => {
      await result.current.refresh({ force: true });
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Failed to fetch staking data.');
  });

  it('retrieves recent transactions', async () => {
    const sampleTx = {
      hash: '0x1234567890abcdef',
      block_num: 100,
      block_timestamp: 1_700_000_000,
      module: 'balances',
      call_module_function: 'transfer',
      fee: '100',
      from_account_id: 'from',
      to_account_id: 'to',
      amount: '25000000000',
      success: true,
    };

    mockFetchSubscanData.mockResolvedValueOnce({
      data: { list: [sampleTx], count: 1 },
    });

    const { result } = renderHook(() => useTransactions('address-789'));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data).toHaveLength(1);

    mockFetchSubscanData.mockResolvedValueOnce({
      data: { list: [sampleTx, { ...sampleTx, hash: '0xfedcba0987654321' }], count: 2 },
    });

    let refreshOutcome: any;
    await act(async () => {
      refreshOutcome = await result.current.refresh({ force: true });
    });

    expect(refreshOutcome.status).toBe('success');
    await waitFor(() => expect(result.current.data).toHaveLength(2));
  });
});
