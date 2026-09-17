import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
  },
  webServer: {
    command:
      'cd ../backend && node node_modules/typescript/bin/tsc && DATABASE_PATH=/tmp/reelbook-playwright.sqlite PORT=4000 node dist/index.js & cd ../frontend && API_PROXY_URL=http://127.0.0.1:4000 node node_modules/next/dist/bin/next dev -p 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
