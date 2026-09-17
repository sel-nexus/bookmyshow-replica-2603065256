import dotenv from 'dotenv';

dotenv.config();

/** Represents validated runtime configuration for the API. */
export interface AppConfig {
  port: number;
  corsOrigin: string;
  databasePath: string;
  jwtSecret: string;
}

/** Parses a positive integer environment setting. */
function parsePort(value: string | undefined): number {
  const port = Number(value ?? '4000');
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid TCP port.');
  }
  return port;
}

/** Returns validated process configuration with safe local defaults. */
export function getConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  const jwtSecret = overrides.jwtSecret ?? process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
  if (jwtSecret.length < 16) {
    throw new Error('JWT_SECRET must be at least 16 characters long.');
  }

  return {
    port: overrides.port ?? parsePort(process.env.PORT),
    corsOrigin: overrides.corsOrigin ?? process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    databasePath: overrides.databasePath ?? process.env.DATABASE_PATH ?? './data/bookmyshow.sqlite',
    jwtSecret
  };
}
