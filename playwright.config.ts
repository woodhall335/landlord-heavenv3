import { defineConfig } from '@playwright/test';

const PORT = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 5000;

export default defineConfig({
  testDir: 'tests',
  timeout: 90_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'off',
  },
  webServer: {
    command: 'pnpm dev',
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
