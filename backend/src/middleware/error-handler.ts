import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

/** Represents an expected HTTP failure with a safe public message. */
export class HttpError extends Error {
  /** Creates a status-coded application error. */
  constructor(public readonly statusCode: number, message: string) {
    super(message);
  }
}

/** Converts known and unexpected failures into consistent API error responses. */
export const errorHandler: ErrorRequestHandler = (
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
): void => {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }
  response.status(500).json({ error: 'An unexpected server error occurred.' });
};
