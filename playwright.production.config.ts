import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'production-live.spec.ts',
  timeout: 45_000,
  retries: 1,
  use: {
    baseURL: process.env.PRODUCTION_FRONTEND_URL || 'https://pai-naidee-ui-spark.vercel.app',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
});
