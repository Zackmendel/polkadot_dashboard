import React, { useEffect, useState } from 'react';
import { fetchSubscanData } from '../utils/subscanApi';

interface Transaction {
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
  // Add more fields as per Subscan's /api/v2/scan/account/transfer response
}

interface TransactionHistoryData {
  count: number;
  list: Transaction[];
}

interface TransactionHistoryProps {
  address: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ address }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTransactionHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchSubscanData<TransactionHistoryData>('account/transfer', {
          address,
          row: 10, // Fetch latest 10 transactions for simplicity
          page: 0,
        });
        if (response && response.data && response.data.list) {
          setTransactions(response.data.list);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        setError('Failed to fetch transaction history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      getTransactionHistory();
    }
  }, [address]);

  if (loading) {
    return <div className="text-center py-4">Loading transaction history...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  if (transactions.length === 0) {
    return <div className="text-center py-4">No transaction history found for this address.</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hash</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Block</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {transactions.map((tx) => (
              <tr key={tx.hash} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{`${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 6)}`}</td>
                <td className="px-6 py-4 whitespace-nowrap">{tx.block_num}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(tx.block_timestamp * 1000).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{`${tx.module}.${tx.call_module_function}`}</td>
                <td className="px-6 py-4 whitespace-nowrap">{parseFloat(tx.amount) / (10 ** 10)} DOT</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {tx.success ? 'Success' : 'Failed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;


