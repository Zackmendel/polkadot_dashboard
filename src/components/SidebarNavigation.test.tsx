import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SidebarNavigation, { SidebarItem } from './SidebarNavigation';

const ITEMS: SidebarItem[] = [
  { id: 'portfolio', label: 'Portfolio overview' },
  { id: 'staking', label: 'Staking overview' },
  { id: 'governance', label: 'Governance participation' },
];

describe('SidebarNavigation', () => {
  it('supports roving focus with arrow keys', async () => {
    const user = userEvent.setup();

    render(
      <SidebarNavigation
        items={ITEMS}
        activeItem="portfolio"
        onSelect={vi.fn()}
        isOpen
        onToggle={vi.fn()}
      />,
    );

    const portfolioButton = screen.getByRole('button', { name: /portfolio overview/i });
    const stakingButton = screen.getByRole('button', { name: /staking overview/i });

    portfolioButton.focus();
    expect(portfolioButton).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(stakingButton).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(portfolioButton).toHaveFocus();
  });

  it('calls onSelect when activated with Enter key', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <SidebarNavigation
        items={ITEMS}
        activeItem="portfolio"
        onSelect={handleSelect}
        isOpen
        onToggle={vi.fn()}
      />,
    );

    const stakingButton = screen.getByRole('button', { name: /staking overview/i });
    stakingButton.focus();

    await user.keyboard('{Enter}');

    expect(handleSelect).toHaveBeenCalledWith('staking');
  });

  it('invokes onToggle when Escape is pressed', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(
      <SidebarNavigation
        items={ITEMS}
        activeItem="portfolio"
        onSelect={vi.fn()}
        isOpen
        onToggle={handleToggle}
      />,
    );

    const portfolioButton = screen.getByRole('button', { name: /portfolio overview/i });
    portfolioButton.focus();

    await user.keyboard('{Escape}');

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});
