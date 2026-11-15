import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'media-http-cache.spec.ts',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'android', use: { ...devices['Pixel 7'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'iphone', use: { ...devices['iPhone 13'] } },
  ],
  use: { serviceWorkers: 'block' },
});
