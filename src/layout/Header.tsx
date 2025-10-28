import React from 'react';

type ThemeMode = 'light' | 'dark';

interface HeaderProps {
  walletAddress: string;
  theme: ThemeMode;
  onThemeToggle: () => void;
  onChangeAddress: () => void;
  isMobileSidebarOpen: boolean;
  onMobileSidebarToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({
  walletAddress,
  theme,
  onThemeToggle,
  onChangeAddress,
  isMobileSidebarOpen,
  onMobileSidebarToggle,
}) => {
  const isDarkMode = theme === 'dark';

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary shadow-sm lg:hidden"
              onClick={onMobileSidebarToggle}
              aria-expanded={isMobileSidebarOpen}
              aria-controls="mobile-dashboard-sidebar"
              aria-label={isMobileSidebarOpen ? 'Hide navigation' : 'Show navigation'}
            >
              {isMobileSidebarOpen ? 'Hide menu' : 'Menu'}
            </button>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Connected wallet</p>
          </div>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Universal Wallet Dashboard</h1>
          <p className="font-mono text-sm text-primary" aria-live="polite">
            {walletAddress}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onThemeToggle}
            aria-pressed={isDarkMode}
            aria-label={isDarkMode ? 'Activate light theme' : 'Activate dark theme'}
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors duration-200 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          </button>
          <button
            type="button"
            onClick={onChangeAddress}
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-error px-4 py-2 text-sm font-semibold text-error-foreground shadow-sm transition-colors duration-200 hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Change wallet address"
          >
            Change address
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
