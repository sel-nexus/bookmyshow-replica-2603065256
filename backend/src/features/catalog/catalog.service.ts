import type Database from 'better-sqlite3';
import { HttpError } from '../../middleware/error-handler';
/** Reads seeded movie and theatre data from SQLite. */
export class CatalogService { constructor(private readonly db: Database.Database) {} /** Returns all seeded movies. */ movies(){return this.db.prepare('SELECT id,title FROM movies ORDER BY id').all();} /** Returns theatres mapped to one known movie. */ theatres(movieId:number){if(!this.db.prepare('SELECT id FROM movies WHERE id=?').get(movieId)) throw new HttpError(404,'Movie not found.'); return this.db.prepare('SELECT t.id,t.name FROM theatres t JOIN movie_theatres mt ON mt.theatre_id=t.id WHERE mt.movie_id=? ORDER BY t.id').all(movieId);} }
