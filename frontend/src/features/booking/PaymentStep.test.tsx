import React, { useState } from 'react';
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PaymentStep } from './PaymentStep';

function PaymentHarness(): JSX.Element {
  const [paidMethod, setPaidMethod] = useState<string | null>(null);

  return paidMethod ? <p role="status">Paid using {paidMethod}.</p> : <PaymentStep onPaid={setPaidMethod} />;
}

afterEach(() => vi.useRealTimers());

describe('PaymentStep', () => {
  it('keeps the card payment in progress until the full two-second delay has elapsed', () => {
    vi.useFakeTimers();
    render(<PaymentHarness />);

    expect(screen.getByLabelText('Card Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Expiry Date')).toBeInTheDocument();
    expect(screen.getByLabelText('CVV')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Pay' }));
    expect(screen.getByRole('status')).toHaveTextContent('Processing Payment');

    act(() => {
      vi.advanceTimersByTime(1999);
    });

    expect(screen.getByRole('status')).toHaveTextContent('Processing Payment');
    expect(screen.queryByText('Paid using card.')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.getByRole('status')).toHaveTextContent('Paid using card.');
  });

  it('switches to the UPI form when that payment option is selected', () => {
    render(<PaymentHarness />);

    fireEvent.click(screen.getByLabelText('UPI'));

    expect(screen.getByLabelText('UPI ID')).toBeInTheDocument();
    expect(screen.queryByLabelText('Card Number')).not.toBeInTheDocument();
  });
});
