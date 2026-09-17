import Database from 'better-sqlite3';

/** Holds the SQLite database and closes it when callers finish. */
export interface DatabaseConnection {
  database: Database.Database;
  close: () => void;
}

/** Creates, migrates, and idempotently seeds the application SQLite database. */
export function createDatabase(databasePath: string): DatabaseConnection {
  const database = new Database(databasePath);
  database.pragma('foreign_keys = ON');
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mobile_number TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS theatres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS movie_theatres (
      movie_id INTEGER NOT NULL REFERENCES movies(id),
      theatre_id INTEGER NOT NULL REFERENCES theatres(id),
      PRIMARY KEY (movie_id, theatre_id)
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      movie_id INTEGER NOT NULL REFERENCES movies(id),
      theatre_id INTEGER NOT NULL REFERENCES theatres(id),
      seats TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      total_price INTEGER NOT NULL
    );
  `);

  const insertMovie = database.prepare('INSERT OR IGNORE INTO movies (title) VALUES (?)');
  ['Paradise', 'Bloody Romeo', 'OG2'].forEach((title) => insertMovie.run(title));
  const insertTheatre = database.prepare('INSERT OR IGNORE INTO theatres (name) VALUES (?)');
  ['Sandhya 70mm', 'Sudharsham 70mm', 'Allu Cinemas'].forEach((name) => insertTheatre.run(name));
  const movies = database.prepare('SELECT id FROM movies').all() as Array<{ id: number }>;
  const theatres = database.prepare('SELECT id FROM theatres').all() as Array<{ id: number }>;
  const map = database.prepare('INSERT OR IGNORE INTO movie_theatres (movie_id, theatre_id) VALUES (?, ?)');
  movies.forEach((movie) => theatres.forEach((theatre) => map.run(movie.id, theatre.id)));

  return { database, close: () => database.close() };
}
