import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { fetchSubscanData } from '../utils/subscanApi';
import { useToast } from './toast/ToastProvider';

interface Token {
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

interface BalanceDisplayProps {
  address: string;
}

const CHART_COLOURS = ['#38bdf8', '#22d3ee', '#a855f7', '#f97316', '#a3e635', '#facc15'];

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ address }) => {
  const { toast } = useToast();
  const [balances, setBalances] = useState<Token[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadBalances = useCallback(
    async (announce: boolean) => {
      if (!address) {
        return false;
      }

      setError(null);

      if (announce) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetchSubscanData<AccountTokensData>('account/tokens', { address });

        if (!response) {
          throw new Error('Unable to retrieve balances from Subscan');
        }

        const list = response.data?.list ?? [];
        setBalances(list);
        setLastUpdated(Date.now());

        if (announce) {
          toast.success(
            'Portfolio refreshed',
            list.length > 0 ? 'Token balances are up to date.' : 'No balances were returned for this address.',
          );
        }

        return true;
      } catch (err) {
        setError('Failed to fetch balances.');

        if (announce) {
          toast.error('Unable to refresh balances', 'We could not load the latest balances. Please try again.');
        }

        return false;
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [address, toast],
  );

  useEffect(() => {
    if (address) {
      loadBalances(false);
    }
  }, [address, loadBalances]);

  const totalUSDValue = useMemo(() => {
    return balances.reduce((sum, token) => {
      const balanceInUnits = parseFloat(token.balance) / 10 ** token.decimals;
      const priceUSD = parseFloat(token.price_usd || '0');
      return sum + balanceInUnits * priceUSD;
    }, 0);
  }, [balances]);

  const pieChartData = useMemo(() => {
    return balances
      .map((token) => {
        const balanceInUnits = parseFloat(token.balance) / 10 ** token.decimals;
        const priceUSD = parseFloat(token.price_usd || '0');
        const usdValue = balanceInUnits * priceUSD;

        return {
          name: token.symbol,
          value: Number.isFinite(usdValue) ? usdValue : 0,
        };
      })
      .filter((entry) => entry.value > 0);
  }, [balances]);

  return (
    <section
      id="portfolio"
      tabIndex={-1}
      aria-labelledby="portfolio-heading"
      aria-describedby="portfolio-description"
      aria-busy={loading || isRefreshing}
      className="mt-18 rounded-2xl border border-border bg-surface p-6 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 id="portfolio-heading" className="text-2xl font-semibold text-foreground">
            Cross-parachain portfolio
          </h2>
          <p id="portfolio-description" className="mt-1 text-sm text-foreground-muted">
            Token balances and distribution across the Polkadot ecosystem.
          </p>
          {lastUpdated && (
            <p className="mt-2 text-xs text-foreground-subtle" aria-live="polite">
              Last updated {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => loadBalances(true)}
          className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors duration-200 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Refresh portfolio balances"
        >
          <span aria-hidden="true" className="text-base">
            ↻
          </span>
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="mt-6 space-y-6" aria-live="polite">
        {loading ? (
          <p role="status" className="text-sm text-foreground-muted">
            Loading balances…
          </p>
        ) : error ? (
          <p role="alert" className="text-sm font-medium text-error">
            {error}
          </p>
        ) : balances.length === 0 ? (
          <p className="text-sm text-foreground-muted">No balances found for this address.</p>
        ) : (
          <>
            <p className="text-lg font-semibold text-foreground">
              Total portfolio value:{' '}
              <span className="font-bold text-primary">
                ${totalUSDValue.toFixed(2)} USD
              </span>
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
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                      Token
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                      USD value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {balances.map((token) => {
                    const balanceInUnits = parseFloat(token.balance) / 10 ** token.decimals;
                    const usdValue = balanceInUnits * parseFloat(token.price_usd || '0');

                    return (
                      <tr key={token.asset_id} className="hover:bg-surface-subtle/70">
                        <td className="px-6 py-4 text-sm text-foreground">{token.symbol}</td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {balanceInUnits.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          ${usdValue.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default BalanceDisplay;
