import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4174';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'admin-cms.spec.ts',
  outputDir: 'test-results/admin-cms',
  use: { baseURL, serviceWorkers: 'block' },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'iPhone Safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run build -- --outDir dist/admin-test && npm run preview -- --outDir dist/admin-test --host 127.0.0.1 --port 4174 --strictPort',
    env: { VITE_API_BASE_URL: baseURL },
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
