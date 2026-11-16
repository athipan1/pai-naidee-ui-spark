import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "elephant-mascot.spec.ts",
  timeout: 45_000,
  use: { baseURL: "http://127.0.0.1:4181", serviceWorkers: "block" },
  projects: [
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
        },
      },
    },
    {
      name: "Android Chrome - Pixel 5",
      use: {
        ...devices["Pixel 5"],
        launchOptions: {
          args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
        },
      },
    },
    { name: "iPhone Safari - iPhone 13", use: { ...devices["iPhone 13"] } },
    { name: "Tablet Safari - iPad Mini", use: { ...devices["iPad Mini"] } },
    { name: "Desktop Safari", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command:
      "npm run build && npm run preview -- --host 127.0.0.1 --port 4181 --strictPort",
    url: "http://127.0.0.1:4181",
    reuseExistingServer: false,
    timeout: 200_000,
  },
});
