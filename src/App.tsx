import React, { useEffect, useRef, useState } from 'react';
import WalletAddressInput from './components/WalletAddressInput';
import BalanceDisplay from './components/BalanceDisplay';
import StakingOverview from './components/StakingOverview';
import GovernanceParticipation from './components/GovernanceParticipation';
import TransactionHistory from './components/TransactionHistory';
import SidebarNavigation, { SidebarItem } from './components/SidebarNavigation';
import { useTheme } from './components/theme/ThemeProvider';

const SECTION_ITEMS: SidebarItem[] = [
  { id: 'portfolio', label: 'Portfolio overview' },
  { id: 'staking', label: 'Staking overview' },
  { id: 'governance', label: 'Governance participation' },
  { id: 'transactions', label: 'Transaction history' },
];

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>(SECTION_ITEMS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const mainRef = useRef<HTMLElement | null>(null);
  const liveRegionRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (walletAddress && mainRef.current) {
      mainRef.current.focus();

      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = `Dashboard loaded for wallet ${walletAddress}`;
      }
    }
  }, [walletAddress]);

  const handleAddressSubmit = (address: string) => {
    setWalletAddress(address);
    setActiveSection(SECTION_ITEMS[0].id);
  };

  const handleSectionSelect = (sectionId: string) => {
    setActiveSection(sectionId);

    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if ('focus' in target && typeof target.focus === 'function') {
        target.focus({ preventScroll: true });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Skip to main content
      </a>
      <span ref={liveRegionRef} aria-live="polite" className="sr-only" />

      {!walletAddress ? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl font-bold text-foreground md:text-5xl">Universal Wallet Dashboard</h1>
            <p className="text-base text-foreground-muted">
              Aggregate balances, staking metrics, governance participation, and transaction history across the Polkadot
              ecosystem.
            </p>
            <WalletAddressInput onAddressSubmit={handleAddressSubmit} />
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col md:flex-row">
          <SidebarNavigation
            items={SECTION_ITEMS}
            activeItem={activeSection}
            onSelect={handleSectionSelect}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen((prev) => !prev)}
          />

          <main
            id="main-content"
            ref={mainRef}
            tabIndex={-1}
            aria-label="Wallet dashboard content"
            className="flex-1 px-4 py-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:px-6 lg:px-12"
          >
            <header className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Connected wallet
                </p>
                <h1 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
                  Universal Wallet Dashboard
                </h1>
                <p className="mt-1 font-mono text-sm text-primary" aria-live="polite">
                  {walletAddress}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-pressed={theme === 'dark'}
                  aria-label={theme === 'dark' ? 'Activate light theme' : 'Activate dark theme'}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors duration-200 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors duration-200 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
                  aria-label={sidebarOpen ? 'Collapse sidebar navigation' : 'Expand sidebar navigation'}
                  aria-pressed={sidebarOpen}
                >
                  {sidebarOpen ? 'Hide sections' : 'Show sections'}
                </button>
                <button
                  type="button"
                  onClick={() => setWalletAddress(null)}
                  className="inline-flex items-center justify-center rounded-full border border-transparent bg-error px-4 py-2 text-sm font-semibold text-error-foreground shadow-sm transition-colors duration-200 hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="Change wallet address"
                >
                  Change address
                </button>
              </div>
            </header>

            <nav aria-label="Dashboard sections" className="mt-6 mb-8 md:hidden">
              <div className="flex flex-wrap gap-2">
                {SECTION_ITEMS.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSectionSelect(item.id)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary'
                          : 'border border-border bg-surface text-foreground hover:bg-surface-hover'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </nav>

            <BalanceDisplay address={walletAddress} />
            <StakingOverview address={walletAddress} />
            <GovernanceParticipation address={walletAddress} />
            <TransactionHistory address={walletAddress} />
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
