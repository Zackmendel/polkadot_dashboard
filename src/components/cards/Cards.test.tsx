import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TokenInfoCard from './TokenInfoCard';
import WalletBalanceCard from './WalletBalanceCard';
import UsdValueCard from './UsdValueCard';
import StakeSummaryCard from './StakeSummaryCard';
import TransactionsCard from './TransactionsCard';
import type { Token } from '../../hooks/useSubscanBalances';
import type { StakingInfo } from '../../hooks/useStakingInfo';
import type { Transaction } from '../../hooks/useTransactions';

describe('TokenInfoCard', () => {
  it('renders network metadata and status badge', () => {
    render(
      <TokenInfoCard
        networkName="Polkadot Relay Chain"
        tokenSymbol="DOT"
        decimals={10}
        assetCount={5}
      />,
    );

    expect(screen.getByText('Token identity')).toBeInTheDocument();
    expect(screen.getByText('Polkadot Relay Chain')).toBeInTheDocument();
    expect(screen.getByText('DOT')).toBeInTheDocument();
    expect(screen.getByText('Live network')).toBeInTheDocument();
  });
});

describe('WalletBalanceCard', () => {
  const TOKENS: Token[] = [
    {
      asset_id: 'dot',
      balance: '1230000000000',
      symbol: 'DOT',
      decimals: 10,
      price_usd: '6.50',
    },
    {
      asset_id: 'aca',
      balance: '500000000000',
      symbol: 'ACA',
      decimals: 12,
      price_usd: '0.10',
    },
  ];

  it('displays converted balances and raw planck values', () => {
    render(<WalletBalanceCard tokens={TOKENS} />);

    expect(screen.getByText(/Wallet balance/)).toBeInTheDocument();
    expect(screen.getByText(/123\.0000 DOT/)).toBeInTheDocument();
    expect(screen.getByText(/1,230,000,000,000 planck/)).toBeInTheDocument();
    expect(screen.getByText(/0\.5000 ACA/)).toBeInTheDocument();
  });
});

describe('UsdValueCard', () => {
  const TOKENS: Token[] = [
    {
      asset_id: 'dot',
      balance: '100000000000',
      symbol: 'DOT',
      decimals: 10,
      price_usd: '0',
    },
  ];

  it('aggregates USD value using provided price', () => {
    render(
      <UsdValueCard
        tokens={TOKENS}
        dotPrice={5}
        priceStatus="success"
        priceUpdatedAt={new Date('2024-01-01T00:00:00Z').getTime()}
      />,
    );

    expect(screen.getByText('USD value')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('Price synced')).toBeInTheDocument();
  });
});

describe('StakeSummaryCard', () => {
  const STAKING: StakingInfo = {
    address: 'addr',
    bondedTo: 'validator-1',
    activeStake: '100 DOT',
    totalStake: '150 DOT',
    unlocking: [{ value: '10 DOT', era: 120 }],
    nominatedValidators: ['validator-1', 'validator-2'],
    balance: '50 DOT',
    locks: [{ id: 'democracy', amount: '5 DOT' }],
  };

  it('shows staking metrics, nominations, and locks', () => {
    render(<StakeSummaryCard staking={STAKING} />);

    expect(screen.getByText('Staking metrics')).toBeInTheDocument();
    expect(screen.getByText('100 DOT')).toBeInTheDocument();
    expect(screen.getByText('validator-1')).toBeInTheDocument();
    expect(screen.getByText('10 DOT')).toBeInTheDocument();
    expect(screen.getByText('democracy')).toBeInTheDocument();
  });
});

describe('TransactionsCard', () => {
  const TRANSACTIONS: Transaction[] = Array.from({ length: 12 }, (_, index) => ({
    hash: `0x${index.toString(16).padStart(64, '0')}`,
    block_num: 1000 + index,
    block_timestamp: 1_700_000_000 + index * 60,
    module: 'balances',
    call_module_function: 'transfer',
    fee: '0',
    from_account_id: 'from',
    to_account_id: 'to',
    amount: '100000000000',
    success: index % 2 === 0,
  }));

  it('paginates and reveals more transactions on demand', async () => {
    const user = userEvent.setup();
    render(<TransactionsCard transactions={TRANSACTIONS} pageSize={5} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(5);

    await user.click(screen.getByRole('button', { name: /load more/i }));
    expect(screen.getAllByRole('listitem')).toHaveLength(10);

    await user.click(screen.getByRole('button', { name: /load more/i }));
    expect(screen.getAllByRole('listitem')).toHaveLength(12);
  });
});
