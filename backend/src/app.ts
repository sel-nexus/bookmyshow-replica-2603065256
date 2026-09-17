import type Database from 'better-sqlite3';
import cors from 'cors';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import type { AppConfig } from './config';
import { createDatabase } from './db/database';
import { createAuthRouter } from './features/auth/auth.routes';
import { AuthService } from './features/auth/auth.service';
import { createCatalogRouter } from './features/catalog/catalog.routes';
import { CatalogService } from './features/catalog/catalog.service';
import { createBookingRouter } from './features/bookings/booking.routes';
import { BookingService } from './features/bookings/booking.service';
import { authenticate } from './middleware/authenticate';
import { errorHandler, HttpError } from './middleware/error-handler';

/** Represents a configured application with a cleanup hook for tests. */
export interface ApplicationHandle {
  app: Express;
  database: Database.Database;
  close: () => void;
}

/** Creates the API application and initializes its SQLite data store. */
export function createApp(config: AppConfig): ApplicationHandle {
  const connection = createDatabase(config.databasePath);
  const app = express();
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.get('/api/health', (_request, response) => response.status(200).json({ status: 'ok' }));
  app.use('/api/auth', createAuthRouter(new AuthService(connection.database, config)));
  app.use('/api', authenticate(config), createCatalogRouter(new CatalogService(connection.database)));
  app.use('/api', authenticate(config), createBookingRouter(new BookingService(connection.database)));
  app.use((_request, _response, next) => next(new HttpError(404, 'Route not found.')));
  app.use((error: Error & { statusCode?: number }, _request: Request, response: Response, _next: NextFunction) => {
    if (error.statusCode && !(error instanceof HttpError)) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }
    errorHandler(error, _request, response, _next);
  });
  return { app, database: connection.database, close: connection.close };
}
