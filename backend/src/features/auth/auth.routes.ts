import { Router } from 'express';
import { z } from 'zod';
import type { AuthService } from './auth.service';
import { HttpError } from '../../middleware/error-handler';

const loginSchema = z.object({ mobileNumber: z.string().regex(/^\d{10}$/, 'Mobile number must contain exactly 10 digits.') });
const verifySchema = loginSchema.extend({ otp: z.string().length(4, 'OTP must contain four digits.') });

/** Builds HTTP routes for the demo mobile OTP session flow. */
export function createAuthRouter(authService: AuthService): Router {
  const router = Router();

  router.post('/login', (request, response, next) => {
    try {
      const payload = loginSchema.parse(request.body);
      response.status(200).json(authService.beginLogin(payload.mobileNumber));
    } catch (error) {
      next(error instanceof z.ZodError ? new HttpError(400, error.issues[0]?.message ?? 'Invalid login input.') : error);
    }
  });

  router.post('/verify', (request, response, next) => {
    try {
      const payload = verifySchema.parse(request.body);
      response.status(200).json(authService.verifyOtp(payload.mobileNumber, payload.otp));
    } catch (error) {
      next(error instanceof z.ZodError ? new HttpError(400, error.issues[0]?.message ?? 'Invalid verification input.') : error);
    }
  });
  return router;
}
