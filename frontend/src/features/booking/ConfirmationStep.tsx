import React from 'react';

interface BookingConfirmation {
  id: number;
  movie: { title: string };
  theatre: { name: string };
  seats: string[];
}

interface ConfirmationStepProps {
  booking: BookingConfirmation;
}

/** Displays persisted booking details returned by the API. */
export function ConfirmationStep({ booking }: ConfirmationStepProps): JSX.Element {
  const seatLabels = Array.isArray(booking.seats)
    ? booking.seats.filter((seat): seat is string => typeof seat === 'string' && seat.trim().length > 0)
    : [];

  return (
    <section role="status" className="mt-8 space-y-2" aria-labelledby="confirmation-heading">
      <h2 id="confirmation-heading" className="font-display text-3xl font-bold">
        Congratulations!
      </h2>
      <p>Booking #{booking.id}</p>
      <p>
        {booking.movie.title} at {booking.theatre.name}
      </p>
      <p>{seatLabels.length > 0 ? seatLabels.join(', ') : 'Seats will be assigned shortly.'}</p>
    </section>
  );
}
