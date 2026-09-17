'use client';

import React, { useEffect, useState, type FormEvent } from 'react';
import { beginLogin, verifyOtp } from '../../lib/api';
import { CatalogStep } from './CatalogStep';
import { ConfirmationStep } from './ConfirmationStep';
import { PaymentStep } from './PaymentStep';
import { SeatStep } from './SeatStep';
import type { Movie, Theatre } from './booking.types';

type Stage = 'mobile' | 'otp' | 'catalog' | 'seat' | 'payment' | 'confirmation';

interface BookingConfirmation {
  id: number;
  movie: { title: string };
  theatre: { name: string };
  seats: string[];
}

function loadStoredBooking(): BookingConfirmation | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedBooking = window.sessionStorage.getItem('confirmedBooking');
    return storedBooking ? (JSON.parse(storedBooking) as BookingConfirmation) : null;
  } catch {
    window.sessionStorage.removeItem('confirmedBooking');
    return null;
  }
}

async function readResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? fallbackMessage);
  }
  return payload;
}

/** Runs the accessible mobile-number and fixed-OTP booking entry flow. */
export function BookingFlow(): JSX.Element {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<Stage>('mobile');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [theatre, setTheatre] = useState<Theatre | null>(null);
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);

  useEffect(() => {
    const storedBooking = loadStoredBooking();
    if (storedBooking) {
      setBooking(storedBooking);
      setStage('confirmation');
    }
  }, []);

  async function submitMobile(event: FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      await beginLogin(mobileNumber);
      setStage('otp');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not start login.');
    } finally {
      setBusy(false);
    }
  }

  async function submitOtp(event: FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      const result = await verifyOtp(mobileNumber, otp);
      sessionStorage.setItem('sessionToken', result.token);
      setStage('catalog');
      setCatalogLoading(true);
      const response = await fetch('/api/movies', {
        headers: { authorization: `Bearer ${result.token}` },
      });
      setMovies(await readResponse<Movie[]>(response, 'Could not load movies.'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not verify OTP.');
    } finally {
      setCatalogLoading(false);
      setBusy(false);
    }
  }

  async function chooseMovie(selectedMovie: Movie): Promise<void> {
    const token = sessionStorage.getItem('sessionToken');
    if (!token) {
      setMessage('Your session has expired. Please sign in again.');
      return;
    }

    setMovie(selectedMovie);
    setTheatres([]);
    setCatalogLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/theatres?movieId=${selectedMovie.id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      setTheatres(await readResponse<Theatre[]>(response, 'Could not load theatres.'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not load theatres.');
    } finally {
      setCatalogLoading(false);
    }
  }

  async function pay(paymentMethod: 'card' | 'upi'): Promise<void> {
    if (!movie || !theatre) {
      return;
    }

    const token = sessionStorage.getItem('sessionToken');
    if (!token) {
      setMessage('Your session has expired. Please sign in again.');
      return;
    }

    setMessage('');
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          movieId: movie.id,
          theatreId: theatre.id,
          seats: ['A1', 'A2', 'A3'],
          paymentMethod,
          totalPrice: 450,
        }),
      });
      const confirmedBooking = await readResponse<BookingConfirmation>(
        response,
        'Booking could not be saved.',
      );
      sessionStorage.setItem('confirmedBooking', JSON.stringify(confirmedBooking));
      setBooking(confirmedBooking);
      setStage('confirmation');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Booking could not be saved.');
    }
  }

  return (
    <section className="min-h-screen bg-cinema-50 px-5 py-14 text-stone-900">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-xl">
        <p className="mb-2 text-sm font-bold uppercase tracking-[.2em] text-cinema-700">
          REELBOOK / HYDERABAD
        </p>
        <h1 className="font-display text-5xl font-bold">Your next film starts here.</h1>
        <p className="mt-3 text-stone-600">Sign in with the demo OTP to discover today&apos;s shows.</p>
        {stage === 'mobile' && (
          <form className="mt-8 space-y-4" onSubmit={submitMobile}>
            <label className="block font-semibold" htmlFor="mobile">
              Mobile number
            </label>
            <input
              id="mobile"
              aria-required="true"
              pattern="[0-9]{10}"
              value={mobileNumber}
              onChange={(event) => setMobileNumber(event.target.value.replace(/\D/g, ''))}
              className="w-full rounded-xl border border-stone-300 p-3"
              inputMode="numeric"
              required
            />
            <button
              disabled={busy}
              className="w-full rounded-xl bg-cinema-500 p-3 font-bold text-white disabled:opacity-60"
            >
              {busy ? 'Sending…' : 'Continue'}
            </button>
          </form>
        )}
        {stage === 'otp' && (
          <form className="mt-8 space-y-4" onSubmit={submitOtp}>
            <label className="block font-semibold" htmlFor="otp">
              Enter OTP
            </label>
            <input
              id="otp"
              aria-required="true"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
              className="w-full rounded-xl border border-stone-300 p-3"
              inputMode="numeric"
              maxLength={4}
              required
            />
            <p className="text-sm text-stone-500">Demo OTP: 1234</p>
            <button
              disabled={busy}
              className="w-full rounded-xl bg-cinema-500 p-3 font-bold text-white disabled:opacity-60"
            >
              {busy ? 'Verifying…' : 'Verify & browse movies'}
            </button>
          </form>
        )}
        {stage === 'catalog' && (
          <>
            {catalogLoading && <p role="status">Loading catalog...</p>}
            <CatalogStep
              movies={movies}
              theatres={theatres}
              onMovie={chooseMovie}
              onTheatre={(selectedTheatre) => {
                setTheatre(selectedTheatre);
                setStage('seat');
              }}
            />
          </>
        )}
        {stage === 'seat' && <SeatStep onSelect={() => setStage('payment')} />}
        {stage === 'payment' && <PaymentStep onPaid={pay} />}
        {stage === 'confirmation' && booking && <ConfirmationStep booking={booking} />}
        {message && (
          <p className="mt-4 text-cinema-700" role="alert">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
