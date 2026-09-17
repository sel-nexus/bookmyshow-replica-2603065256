import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { AppConfig } from '../config';
import { HttpError } from './error-handler';

/** Authenticated session claims carried by the demo JWT. */
export interface SessionClaims {
  userId: number;
  mobileNumber: string;
}

/** Adds authenticated user claims to an Express request. */
export interface AuthenticatedRequest extends Request {
  session?: SessionClaims;
}

/** Returns middleware that validates bearer tokens for protected endpoints. */
export function authenticate(config: AppConfig) {
  return (request: AuthenticatedRequest, _response: Response, next: NextFunction): void => {
    const value = request.header('authorization');
    if (!value?.startsWith('Bearer ')) {
      next(new HttpError(401, 'Authentication is required.'));
      return;
    }
    try {
      const claims = jwt.verify(value.slice(7), config.jwtSecret) as SessionClaims;
      request.session = claims;
      next();
    } catch {
      next(new HttpError(401, 'Session token is invalid or expired.'));
    }
  };
}
