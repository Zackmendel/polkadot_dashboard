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
      className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition"
      aria-labelledby="wallet-address-form-heading"
    >
      <div className="space-y-4">
        <div>
          <h2 id="wallet-address-form-heading" className="text-xl font-semibold text-foreground">
            Connect your wallet
          </h2>
          <p id="wallet-address-helper" className="mt-1 text-sm text-foreground-muted">
            Enter a Polkadot wallet address to load balances, staking, and governance activity.
          </p>
        </div>
        <label htmlFor="walletAddress" className="block text-sm font-medium text-foreground">
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
            className={`flex-1 rounded-lg border px-4 py-2 text-base text-foreground shadow-sm transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
              isInvalid
                ? 'border-error focus-visible:ring-error'
                : 'border-border bg-surface focus-visible:ring-primary'
            }`}
            inputMode="text"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label="Load dashboard data for wallet address"
          >
            Load Dashboard
          </button>
        </div>
        <p id="wallet-address-instructions" className="text-xs text-foreground-subtle">
          Address is requested on demand only – no data is persisted.
        </p>
        {isInvalid && (
          <p role="alert" className="text-sm font-medium text-error">
            Please enter a wallet address before continuing.
          </p>
        )}
      </div>
    </form>
  );
};

export default WalletAddressInput;
