import React, { useEffect, useRef, useState } from 'react';
import WalletAddressInput from './components/WalletAddressInput';
import BalanceDisplay from './components/BalanceDisplay';
import StakingOverview from './components/StakingOverview';
import GovernanceParticipation from './components/GovernanceParticipation';
import TransactionHistory from './components/TransactionHistory';
import SidebarNavigation, { SidebarItem } from './components/SidebarNavigation';

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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    const stored = window.localStorage.getItem('wallet-dashboard-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    const prefersDark = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;

    return prefersDark ? 'dark' : 'light';
  });

  const mainRef = useRef<HTMLElement | null>(null);
  const liveRegionRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('wallet-dashboard-theme', theme);
    }
  }, [theme]);

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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const layoutClass = theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';

  return (
    <div className={`${layoutClass} min-h-screen`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-sky-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        Skip to main content
      </a>
      <span ref={liveRegionRef} aria-live="polite" className="sr-only" />

      {!walletAddress ? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
              Universal Wallet Dashboard
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Aggregate balances, staking metrics, governance participation, and transaction history across
              the Polkadot ecosystem.
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
            className="flex-1 px-4 py-6 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500 sm:px-6 lg:px-12"
          >
            <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-500 dark:text-sky-300">
                  Connected wallet
                </p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
                  Universal Wallet Dashboard
                </h1>
                <p className="mt-1 font-mono text-sm text-sky-600 dark:text-sky-300" aria-live="polite">
                  {walletAddress}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-pressed={theme === 'dark'}
                  aria-label={theme === 'dark' ? 'Activate light theme' : 'Activate dark theme'}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 md:hidden"
                  aria-label={sidebarOpen ? 'Collapse sidebar navigation' : 'Expand sidebar navigation'}
                  aria-pressed={sidebarOpen}
                >
                  {sidebarOpen ? 'Hide sections' : 'Show sections'}
                </button>
                <button
                  type="button"
                  onClick={() => setWalletAddress(null)}
                  className="inline-flex items-center justify-center rounded-full border border-rose-400 bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200 dark:border-rose-500"
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
                      className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-sm hover:bg-sky-600'
                          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
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
