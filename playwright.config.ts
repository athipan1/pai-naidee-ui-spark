import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Only run the specific E2E test file to avoid conflicts with Vitest tests.
  testMatch: /.*verify\.spec\.ts/,

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:8080',
  },
});
