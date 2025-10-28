import React, { useState } from 'react';

interface WalletAddressInputProps {
  onAddressSubmit: (address: string) => void;
}

const WalletAddressInput: React.FC<WalletAddressInputProps> = ({ onAddressSubmit }) => {
  const [address, setAddress] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onAddressSubmit(address.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter Polkadot Wallet Address"
          className="flex-grow p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Load Dashboard
        </button>
      </div>
    </form>
  );
};

export default WalletAddressInput;


