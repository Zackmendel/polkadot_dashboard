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
      className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 id="portfolio-heading" className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Cross-parachain portfolio
          </h2>
          <p id="portfolio-description" className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Token balances and distribution across the Polkadot ecosystem.
          </p>
          {lastUpdated && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
              Last updated {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => loadBalances(true)}
          className="inline-flex items-center gap-2 self-start rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
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
          <p role="status" className="text-sm text-slate-600 dark:text-slate-300">
            Loading balances…
          </p>
        ) : error ? (
          <p role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : balances.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No balances found for this address.
          </p>
        ) : (
          <>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Total portfolio value:{' '}
              <span className="font-bold text-sky-600 dark:text-sky-300">
                ${totalUSDValue.toFixed(2)} USD
              </span>
            </p>

            {pieChartData.length > 0 && (
              <div className="w-full rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40">
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
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" aria-label="Token balances">
                <thead className="bg-slate-100 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Token
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      USD value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {balances.map((token) => {
                    const balanceInUnits = parseFloat(token.balance) / 10 ** token.decimals;
                    const usdValue = balanceInUnits * parseFloat(token.price_usd || '0');

                    return (
                      <tr key={token.asset_id} className="hover:bg-slate-100/70 dark:hover:bg-slate-800/60">
                        <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">{token.symbol}</td>
                        <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">
                          {balanceInUnits.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">
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
