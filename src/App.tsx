import React, { useState } from 'react';
import WalletAddressInput from './components/WalletAddressInput';
import BalanceDisplay from './components/BalanceDisplay';
import StakingOverview from './components/StakingOverview';
import GovernanceParticipation from './components/GovernanceParticipation';
import TransactionHistory from './components/TransactionHistory';

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleAddressSubmit = (address: string) => {
    setWalletAddress(address);
    console.log("Wallet Address Submitted:", address);
    // Here you would typically trigger data fetching for the dashboard
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Universal Wallet Dashboard</h1>
      {!walletAddress ? (
        <div className="max-w-md mx-auto">
          <WalletAddressInput onAddressSubmit={handleAddressSubmit} />
        </div>
      ) : (
        <div className="container mx-auto mt-8">
          <p className="text-lg mb-4 text-center">Dashboard for: <span className="font-mono text-blue-400">{walletAddress}</span></p>
          <BalanceDisplay address={walletAddress} />
          <StakingOverview address={walletAddress} />
          <GovernanceParticipation address={walletAddress} />
          <TransactionHistory address={walletAddress} />
          <div className="text-center mt-6">
            <button 
              onClick={() => setWalletAddress(null)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Change Address
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
