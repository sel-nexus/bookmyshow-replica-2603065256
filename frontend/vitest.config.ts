import { defineConfig } from 'vitest/config';
/** Configures browser-like component tests without changing Next.js builds. */
export default defineConfig({ test: { environment: 'jsdom', globals: true } });
