import React, { useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import LoadableCard from './LoadableCard';
import BalanceSkeleton from './skeletons/BalanceSkeleton';
import { useSubscanBalances, Token } from '../hooks/useSubscanBalances';
import { useToast } from './toast/ToastProvider';

interface BalanceDisplayProps {
  address: string;
}

const CHART_COLOURS = ['#38bdf8', '#22d3ee', '#a855f7', '#f97316', '#a3e635', '#facc15'];

const BalanceContent: React.FC<{ balances: Token[] }> = ({ balances }) => {
  const totalUSDValue = useMemo(() => {
    return balances.reduce((sum, token) => {
      const balanceInUnits = parseFloat(token.balance) / 10 ** token.decimals;
      const priceUSD = parseFloat(token.price_usd || '0');
      return sum + balanceInUnits * priceUSD;
    }, 0);
  }, [balances]);

  const pieChartData = useMemo(
    () =>
      balances
        .map((token) => {
          const balanceInUnits = parseFloat(token.balance) / 10 ** token.decimals;
          const priceUSD = parseFloat(token.price_usd || '0');
          const usdValue = balanceInUnits * priceUSD;

          return {
            name: token.symbol,
            value: Number.isFinite(usdValue) ? usdValue : 0,
          };
        })
        .filter((entry) => entry.value > 0),
    [balances],
  );

  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-foreground">
        Total portfolio value:{' '}
        <span className="font-bold text-primary">${totalUSDValue.toFixed(2)} USD</span>
      </p>

      {pieChartData.length > 0 && (
        <div className="w-full rounded-xl bg-surface-subtle p-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={110}
                  fill="#0ea5e9"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={CHART_COLOURS[index % CHART_COLOURS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border/60" aria-label="Token balances">
          <thead className="bg-surface-subtle">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">Token</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">USD value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {balances.map((token) => {
              const balanceInUnits = parseFloat(token.balance) / 10 ** token.decimals;
              const usdValue = balanceInUnits * parseFloat(token.price_usd || '0');

              return (
                <tr key={token.asset_id} className="hover:bg-surface-subtle/70">
                  <td className="px-6 py-4 text-sm text-foreground">{token.symbol}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{balanceInUnits.toFixed(4)}</td>
                  <td className="px-6 py-4 text-sm text-foreground">${usdValue.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ address }) => {
  const { toast } = useToast();
  const { data: balances, status, error, refresh, isRefreshing, lastUpdated } = useSubscanBalances(address);

  const handleRefresh = useCallback(async () => {
    const { status: refreshStatus, data: refreshedBalances } = await refresh({ force: true });

    if (refreshStatus === 'error') {
      toast.error('Unable to refresh balances', 'We could not load the latest balances. Please try again.');
      return;
    }

    toast.success(
      'Portfolio refreshed',
      refreshedBalances.length > 0
        ? 'Token balances are up to date.'
        : 'No balances were returned for this address.',
    );
  }, [refresh, toast]);

  return (
    <LoadableCard
      id="portfolio"
      heading="Cross-parachain portfolio"
      description="Token balances and distribution across the Polkadot ecosystem."
      status={status}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      skeleton={<BalanceSkeleton />}
      empty={<p className="text-sm text-foreground-muted">No balances found for this address.</p>}
    >
      <BalanceContent balances={balances} />
    </LoadableCard>
  );
};

export default BalanceDisplay;
