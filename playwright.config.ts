// @ts-ignore - @playwright/test is an optional dev dependency
import { defineConfig } from '@playwright/test';

const PORT = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 5000;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
