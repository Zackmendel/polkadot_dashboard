import React, { useEffect, useState } from 'react';
import { getStakingInfo } from '../utils/polkadotApi';

interface StakingInfo {
  address: string;
  bondedTo: string;
  activeStake: string;
  totalStake: string;
  unlocking: Array<{ value: string; era: number }>;
  nominatedValidators: string[];
  balance: string;
  locks: Array<{ id: string; amount: string }>;
}

interface StakingOverviewProps {
  address: string;
}

const StakingOverview: React.FC<StakingOverviewProps> = ({ address }) => {
  const [stakingData, setStakingData] = useState<StakingInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStakingData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStakingInfo(address);
        setStakingData(data);
      } catch (err) {
        setError('Failed to fetch staking data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchStakingData();
    }
  }, [address]);

  if (loading) {
    return <div className="text-center py-4">Loading staking overview...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  if (!stakingData) {
    return <div className="text-center py-4">No staking data found for this address.</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Staking Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Bonded To</h3>
          <p>{stakingData.bondedTo}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Active Stake</h3>
          <p>{stakingData.activeStake}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Total Stake</h3>
          <p>{stakingData.totalStake}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Balance</h3>
          <p>{stakingData.balance}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Nominated Validators</h3>
          <p>{stakingData.nominatedValidators.join(', ') || 'None'}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Unlocking</h3>
          {stakingData.unlocking.length > 0 ? (
            <ul>
              {stakingData.unlocking.map((u, index) => (
                <li key={index}>Value: {u.value}, Era: {u.era}</li>
              ))}
            </ul>
          ) : (
            <p>None</p>
          )}
        </div>
        <div className="bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Locks</h3>
          {stakingData.locks.length > 0 ? (
            <ul>
              {stakingData.locks.map((l, index) => (
                <li key={index}>ID: {l.id}, Amount: {l.amount}</li>
              ))}
            </ul>
          ) : (
            <p>None</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StakingOverview;
