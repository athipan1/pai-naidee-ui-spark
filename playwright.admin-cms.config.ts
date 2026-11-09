import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4174';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'admin-cms.spec.ts',
  timeout: 60_000,
  workers: 2,
  reporter: [['list'], ['json', { outputFile: 'test-results/admin-cms-results.json' }]],
  outputDir: 'test-results/admin-cms',
  use: { baseURL, serviceWorkers: 'block' },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'iPhone Safari', use: { ...devices['iPhone 13'] } },
    { name: 'Tablet Safari', use: { ...devices['iPad Mini'] } },
    { name: 'Android Chrome', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run build -- --outDir dist/admin-test && npm run preview -- --outDir dist/admin-test --host 127.0.0.1 --port 4174 --strictPort',
    env: { VITE_API_BASE_URL: baseURL },
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
