# ReelBook

A private, proprietary BookMyShow-style demo built with Next.js, Express, and SQLite.

## Demo
Use any 10-digit mobile number and OTP `1234`.

## Run
1. `cd backend && npm install && npm run dev`
2. `cd frontend && npm install && npm run dev`
3. Open `http://localhost:3000`.

## Verify
- Backend tests: `cd backend && node node_modules/vitest/vitest.mjs run`
- Frontend tests: `cd frontend && node node_modules/vitest/vitest.mjs run`
- Frontend build: `cd frontend && NODE_ENV=production node node_modules/next/dist/bin/next build`
- Compose: `docker compose up --build -d`

## License
Private and proprietary.
