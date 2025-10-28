import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, vi } from 'vitest';
import { ToastProvider, useToast } from './ToastProvider';

const TriggerToast: React.FC<{ intent?: 'success' | 'error' | 'info' }> = ({ intent = 'success' }) => {
  const { toast } = useToast();

  const handleClick = () => {
    const title = intent === 'success' ? 'Success' : intent === 'error' ? 'Error' : 'Info';
    const description = `${title} toast message`;

    switch (intent) {
      case 'error':
        toast.error(title, description, { duration: 2000 });
        break;
      case 'info':
        toast.info(title, description, { duration: 2000 });
        break;
      default:
        toast.success(title, description, { duration: 2000 });
        break;
    }
  };

  return (
    <button type="button" onClick={handleClick}>
      Trigger toast
    </button>
  );
};

describe('ToastProvider', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders and auto-dismisses a toast after the configured duration', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <ToastProvider>
        <TriggerToast />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: /trigger toast/i }));

    expect(await screen.findByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Success toast message')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2200);
    });

    await waitFor(() => {
      expect(screen.queryByText('Success toast message')).not.toBeInTheDocument();
    });
  });

  it('can dismiss a toast via the close button with keyboard interaction', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <TriggerToast intent="info" />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: /trigger toast/i }));

    const dismissButton = await screen.findByRole('button', { name: /dismiss notification/i });

    dismissButton.focus();
    expect(dismissButton).toHaveFocus();

    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.queryByText('Info toast message')).not.toBeInTheDocument();
    });
  });
});
