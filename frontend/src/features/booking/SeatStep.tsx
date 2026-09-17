import React, { useState } from 'react';

interface SeatStepProps {
  onSelect: (seats: string[], price: number) => void;
}

const presetSeats = ['A1', 'A2', 'A3'];
const seatLabels = ['A1', 'A2', 'A3', 'A4', 'A5'];

/** Shows the prescribed visual seat grid and preset-seat action. */
export function SeatStep({ onSelect }: SeatStepProps): JSX.Element {
  const [selected, setSelected] = useState(false);

  function selectPresetSeats(): void {
    setSelected(true);
    onSelect(presetSeats, 450);
  }

  return (
    <section className="mt-8 space-y-4" aria-labelledby="seat-heading">
      <h2 id="seat-heading" className="font-display text-3xl font-bold">
        Select seats
      </h2>
      <div aria-label="Seat grid" className="flex flex-wrap gap-3">
        {seatLabels.map((seat) => (
          <span key={seat} aria-label={seat} className="rounded border border-stone-300 px-3 py-2">
            {selected && presetSeats.includes(seat) ? '●' : '○'} {seat}
          </span>
        ))}
      </div>
      <button
        type="button"
        className="w-full rounded-xl bg-cinema-500 p-3 font-bold text-white"
        onClick={selectPresetSeats}
      >
        Select Seats
      </button>
      {selected && <p>Rs. 450 — A1, A2, A3</p>}
    </section>
  );
}
