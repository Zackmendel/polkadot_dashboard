import React, { useState } from 'react';

interface WalletAddressInputProps {
  onAddressSubmit: (address: string) => void;
}

const WalletAddressInput: React.FC<WalletAddressInputProps> = ({ onAddressSubmit }) => {
  const [address, setAddress] = useState<string>('');
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = address.trim();

    if (!trimmed) {
      setHasInteracted(true);
      return;
    }

    onAddressSubmit(trimmed);
    setHasInteracted(false);
  };

  const isInvalid = hasInteracted && address.trim().length === 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-700 dark:bg-slate-900"
      aria-labelledby="wallet-address-form-heading"
    >
      <div className="space-y-4">
        <div>
          <h2 id="wallet-address-form-heading" className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Connect your wallet
          </h2>
          <p id="wallet-address-helper" className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Enter a Polkadot wallet address to load balances, staking, and governance activity.
          </p>
        </div>
        <label htmlFor="walletAddress" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Wallet address
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            id="walletAddress"
            name="walletAddress"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            onBlur={() => setHasInteracted(true)}
            placeholder="13abc...your address"
            aria-describedby="wallet-address-helper wallet-address-instructions"
            aria-invalid={isInvalid ? 'true' : 'false'}
            autoComplete="off"
            className={`flex-1 rounded-lg border px-4 py-2 text-base text-slate-900 shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:text-slate-100 ${
              isInvalid
                ? 'border-rose-500 focus-visible:outline-rose-500 dark:border-rose-500'
                : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
            }`}
            inputMode="text"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg border border-sky-500 bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            aria-label="Load dashboard data for wallet address"
          >
            Load Dashboard
          </button>
        </div>
        <p id="wallet-address-instructions" className="text-xs text-slate-500 dark:text-slate-400">
          Address is requested on demand only – no data is persisted.
        </p>
        {isInvalid && (
          <p role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-400">
            Please enter a wallet address before continuing.
          </p>
        )}
      </div>
    </form>
  );
};

export default WalletAddressInput;
