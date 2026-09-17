import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConfirmationStep } from './ConfirmationStep';

describe('ConfirmationStep', () => {
  it('displays the persisted booking details and selected seats', () => {
    render(
      <ConfirmationStep
        booking={{
          id: 42,
          movie: { title: 'Paradise' },
          theatre: { name: 'Sandhya 70mm' },
          seats: ['A1', 'A2', 'A3'],
        }}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Booking #42');
    expect(screen.getByText('Paradise at Sandhya 70mm')).toBeInTheDocument();
    expect(screen.getByText('A1, A2, A3')).toBeInTheDocument();
  });

  it('uses the assignment fallback for empty or malformed seat labels', () => {
    render(
      <ConfirmationStep
        booking={{
          id: 42,
          movie: { title: 'Paradise' },
          theatre: { name: 'Sandhya 70mm' },
          seats: [null, '', '  '] as unknown as string[],
        }}
      />,
    );

    expect(screen.getByText('Seats will be assigned shortly.')).toBeInTheDocument();
  });
});
