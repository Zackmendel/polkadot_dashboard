import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { fetchSubscanData } from '../utils/subscanApi';

interface Token {
  asset_id: string;
  balance: string;
  symbol: string;
  decimals: number;
  price_usd: string; // Assuming Subscan provides USD price
}

interface AccountTokensData {
  count: number;
  list: Token[];
  module: string[];
}

interface BalanceDisplayProps {
  address: string;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ address }) => {
  const [balances, setBalances] = useState<Token[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getBalances = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchSubscanData<AccountTokensData>('account/tokens', { address });
        if (response && response.data && response.data.list) {
          setBalances(response.data.list);
        } else {
          setBalances([]);
        }
      } catch (err) {
        setError('Failed to fetch balances.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      getBalances();
    }
  }, [address]);

  if (loading) {
    return <div className="text-center py-4">Loading balances...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  if (balances.length === 0) {
    return <div className="text-center py-4">No balances found for this address.</div>;
  }

  const totalUSDValue = balances.reduce((sum, token) => {
    const balanceInUnits = parseFloat(token.balance) / (10 ** token.decimals);
    const priceUSD = parseFloat(token.price_usd);
    return sum + (balanceInUnits * priceUSD);
  }, 0);

  const pieChartData = balances.map(token => {
    const balanceInUnits = parseFloat(token.balance) / (10 ** token.decimals);
    const usdValue = balanceInUnits * parseFloat(token.price_usd);
    return { name: token.symbol, value: usdValue };
  }).filter(data => data.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FFC0CB'];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Cross-Parachain Portfolio</h2>
      <p className="text-xl mb-4">Total Portfolio Value: <span className="font-bold text-green-400">${totalUSDValue.toFixed(2)} USD</span></p>
      
      {pieChartData.length > 0 && (
        <div className="w-full h-80 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`}/>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Token</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">USD Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {balances.map((token) => {
              const balanceInUnits = parseFloat(token.balance) / (10 ** token.decimals);
              const usdValue = balanceInUnits * parseFloat(token.price_usd);
              return (
                <tr key={token.asset_id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">{token.symbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{balanceInUnits.toFixed(4)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${usdValue.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BalanceDisplay;
