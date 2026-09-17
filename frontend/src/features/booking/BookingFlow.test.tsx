import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BookingFlow } from './BookingFlow';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe('BookingFlow login', () => {
  it('moves to OTP entry after a successful mobile submission', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ message: 'OTP sent' }) }),
    );
    render(<BookingFlow />);

    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '9876543210' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByLabelText('Enter OTP')).toBeInTheDocument();
  });

  it('renders server validation feedback for a failed login', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Mobile number must contain exactly 10 digits.' }),
      }),
    );
    render(<BookingFlow />);

    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '9876543210' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('10 digits'));
  });

  it('keeps the visitor on OTP entry and shows an invalid OTP error', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'OTP sent' }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'OTP must contain four digits.' }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<BookingFlow />);

    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '9876543210' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByLabelText('Enter OTP');
    fireEvent.change(screen.getByLabelText('Enter OTP'), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify & browse movies' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('four digits'));
    expect(screen.getByLabelText('Enter OTP')).toBeInTheDocument();
  });

  it('renders the catalog returned after a successful OTP verification', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'OTP sent' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ token: 'signed-token' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, title: 'Paradise' }] });
    vi.stubGlobal('fetch', fetchMock);
    render(<BookingFlow />);

    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '9876543210' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByLabelText('Enter OTP');
    fireEvent.change(screen.getByLabelText('Enter OTP'), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify & browse movies' }));

    expect(await screen.findByRole('button', { name: 'Paradise' })).toBeInTheDocument();
  });
});
