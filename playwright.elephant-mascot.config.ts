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
        viewport: { width: 1440, height: 900 },
        launchOptions: {
          args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
        },
      },
    },
    {
      name: "Android Chrome - Pixel 5",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 393, height: 873 },
        launchOptions: {
          args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
        },
      },
    },
    {
      name: "Android Chrome - 360x800",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 360, height: 800 },
        launchOptions: {
          args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
        },
      },
    },
    {
      name: "iPhone Safari - iPhone 13",
      use: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 } },
    },
    {
      name: "iPhone Safari - iPhone 15 Pro Max",
      use: {
        ...devices["iPhone 15 Pro Max"],
        viewport: { width: 430, height: 932 },
      },
    },
    { name: "iPhone Safari - small", use: { ...devices["iPhone X"] } },
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
