import React from 'react';
import type { Movie, Theatre } from './booking.types';

interface CatalogStepProps {
  movies: Movie[];
  theatres: Theatre[];
  onMovie: (movie: Movie) => void;
  onTheatre: (theatre: Theatre) => void;
}

/** Renders API-supplied movies and theatres for selection. */
export function CatalogStep({
  movies,
  theatres,
  onMovie,
  onTheatre,
}: CatalogStepProps): JSX.Element {
  const hasCatalogItems = movies.length > 0 || theatres.length > 0;

  return (
    <section aria-labelledby="catalog-heading" className="mt-8 space-y-6">
      <h2 id="catalog-heading" className="font-display text-3xl font-bold">
        Now showing
      </h2>
      {!hasCatalogItems && (
        <p role="status" className="rounded-xl bg-stone-100 p-4 text-stone-700">
          No movies or theatres are available right now. Please try again shortly.
        </p>
      )}
      {movies.length > 0 && (
        <div className="space-y-2">
          {movies.map((movie) => (
            <button
              key={movie.id}
              type="button"
              className="w-full rounded-xl border border-stone-200 p-3 text-left font-semibold hover:border-cinema-500"
              onClick={() => onMovie(movie)}
            >
              {movie.title}
            </button>
          ))}
        </div>
      )}
      <h2 className="font-display text-3xl font-bold">Choose a theatre</h2>
      {theatres.length > 0 && (
        <div className="space-y-2">
          {theatres.map((theatre) => (
            <button
              key={theatre.id}
              type="button"
              className="w-full rounded-xl border border-stone-200 p-3 text-left font-semibold hover:border-cinema-500"
              onClick={() => onTheatre(theatre)}
            >
              {theatre.name}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
