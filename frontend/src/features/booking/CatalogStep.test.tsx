import React, { useState } from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CatalogStep } from './CatalogStep';
import { SeatStep } from './SeatStep';

function CatalogHarness(): JSX.Element {
  const [selection, setSelection] = useState('');

  return (
    <>
      <CatalogStep
        movies={[{ id: 1, title: 'Paradise' }]}
        theatres={[{ id: 2, name: 'Sandhya 70mm' }]}
        onMovie={(movie) => setSelection(`Movie selected: ${movie.title}`)}
        onTheatre={(theatre) => setSelection(`Theatre selected: ${theatre.name}`)}
      />
      {selection && <p role="status">{selection}</p>}
    </>
  );
}

describe('CatalogStep', () => {
  it('renders API-supplied choices and exposes each selection to the visitor', () => {
    render(<CatalogHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Paradise' }));
    expect(screen.getByRole('status')).toHaveTextContent('Movie selected: Paradise');

    fireEvent.click(screen.getByRole('button', { name: 'Sandhya 70mm' }));
    expect(screen.getByRole('status')).toHaveTextContent('Theatre selected: Sandhya 70mm');
  });

  it('announces an accessible empty state when no catalog choices are available', () => {
    render(<CatalogStep movies={[]} theatres={[]} onMovie={vi.fn()} onTheatre={vi.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent('No movies or theatres are available');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('SeatStep', () => {
  it('shows the preset seat selection and its total', () => {
    render(<SeatStep onSelect={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Select Seats' }));

    expect(screen.getByText('Rs. 450 — A1, A2, A3')).toBeInTheDocument();
  });
});
