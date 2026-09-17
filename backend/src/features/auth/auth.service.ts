import type Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import type { AppConfig } from '../../config';
import { HttpError } from '../../middleware/error-handler';

/** Represents the safe user data returned after OTP verification. */
export interface SessionUser {
  id: number;
  mobileNumber: string;
}

/** Provides mobile login and fixed demo OTP verification behavior. */
export class AuthService {
  /** Creates an authentication service backed by SQLite. */
  constructor(private readonly database: Database.Database, private readonly config: AppConfig) {}

  /** Accepts a valid mobile number and begins the demo OTP challenge. */
  beginLogin(mobileNumber: string): { message: string } {
    this.ensureMobile(mobileNumber);
    return { message: 'OTP sent' };
  }

  /** Verifies the fixed demo OTP and returns a signed session token. */
  verifyOtp(mobileNumber: string, otp: string): { token: string; user: SessionUser } {
    this.ensureMobile(mobileNumber);
    if (otp !== '1234') {
      throw new HttpError(401, 'The demo OTP is invalid.');
    }
    this.database.prepare('INSERT OR IGNORE INTO users (mobile_number) VALUES (?)').run(mobileNumber);
    const user = this.database.prepare('SELECT id, mobile_number FROM users WHERE mobile_number = ?').get(mobileNumber) as { id: number; mobile_number: string };
    const sessionUser = { id: user.id, mobileNumber: user.mobile_number };
    const token = jwt.sign({ userId: sessionUser.id, mobileNumber: sessionUser.mobileNumber }, this.config.jwtSecret, { expiresIn: '1h' });
    return { token, user: sessionUser };
  }

  /** Rejects malformed mobile numbers at the service boundary. */
  private ensureMobile(mobileNumber: string): void {
    if (!/^\d{10}$/.test(mobileNumber)) {
      throw new HttpError(400, 'Mobile number must contain exactly 10 digits.');
    }
  }
}
