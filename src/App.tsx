import React, { useEffect, useRef, useState } from 'react';
import WalletAddressInput from './components/WalletAddressInput';
import BalanceDisplay from './components/BalanceDisplay';
import StakingOverview from './components/StakingOverview';
import GovernanceParticipation from './components/GovernanceParticipation';
import TransactionHistory from './components/TransactionHistory';
import { useTheme } from './components/theme/ThemeProvider';
import DashboardShell from './layout/DashboardShell';
import Header from './layout/Header';
import SidebarNav, { SidebarNavItem } from './layout/SidebarNav';
import MainContent from './layout/MainContent';

const SECTION_ITEMS: SidebarNavItem[] = [
  { id: 'portfolio', label: 'Portfolio overview' },
  { id: 'staking', label: 'Staking overview' },
  { id: 'governance', label: 'Governance participation' },
  { id: 'transactions', label: 'Transaction history' },
];

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>(SECTION_ITEMS[0].id);
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
    setIsDesktopSidebarExpanded(true);
    setIsMobileSidebarOpen(false);
  };

  const handleSectionSelect = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileSidebarOpen(false);

    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if ('focus' in target && typeof target.focus === 'function') {
        target.focus({ preventScroll: true });
      }
    }
  };

  const handleResetWallet = () => {
    setWalletAddress(null);
    setActiveSection(SECTION_ITEMS[0].id);
    setIsDesktopSidebarExpanded(true);
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="bg-background text-foreground transition-colors duration-300">
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
        <DashboardShell
          header={
            <Header
              walletAddress={walletAddress}
              theme={theme}
              onThemeToggle={toggleTheme}
              onChangeAddress={handleResetWallet}
              isMobileSidebarOpen={isMobileSidebarOpen}
              onMobileSidebarToggle={() => setIsMobileSidebarOpen((prev) => !prev)}
            />
          }
          sidebar={
            <SidebarNav
              items={SECTION_ITEMS}
              activeItem={activeSection}
              onSelect={handleSectionSelect}
              isDesktopExpanded={isDesktopSidebarExpanded}
              onDesktopToggle={() => setIsDesktopSidebarExpanded((prev) => !prev)}
              isMobileOpen={isMobileSidebarOpen}
              onMobileClose={() => setIsMobileSidebarOpen(false)}
            />
          }
        >
          <MainContent
            ref={mainRef}
            sections={[
              {
                key: 'portfolio',
                content: <BalanceDisplay address={walletAddress} />,
                className: 'lg:col-span-12 xl:col-span-8',
              },
              {
                key: 'staking',
                content: <StakingOverview address={walletAddress} />,
                className: 'lg:col-span-6 xl:col-span-4',
              },
              {
                key: 'governance',
                content: <GovernanceParticipation address={walletAddress} />,
                className: 'lg:col-span-6 xl:col-span-6',
              },
              {
                key: 'transactions',
                content: <TransactionHistory address={walletAddress} />,
                className: 'lg:col-span-12 xl:col-span-6',
              },
            ]}
          />
        </DashboardShell>
      )}
    </div>
  );
};

export default App;
