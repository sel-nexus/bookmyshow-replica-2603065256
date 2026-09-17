import { getConfig } from './config';
import { createApp } from './app';

/** Starts the configured HTTP API server. */
function start(): void {
  const config = getConfig();
  const { app } = createApp(config);
  app.listen(config.port, '0.0.0.0', () => {
    console.info(`BookMyShow API listening on ${config.port}`);
  });
}

start();
