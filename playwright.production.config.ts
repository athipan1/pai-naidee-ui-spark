import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'production-live.spec.ts',
  timeout: 45_000,
  retries: 1,
  projects: [
    { name:'Desktop Chrome', use:{...devices['Desktop Chrome']} },
    { name:'Android Chrome', use:{...devices['Pixel 7']} },
    { name:'iPhone Safari', use:{...devices['iPhone 13']} },
  ],
  use: {
    baseURL: process.env.PRODUCTION_FRONTEND_URL || 'https://pai-naidee-ui-spark.vercel.app',
    trace: 'retain-on-failure',
  },
});
