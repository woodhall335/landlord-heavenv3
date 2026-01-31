// Vitest global setup

import { vi, afterEach, beforeEach } from 'vitest';
import { config as loadEnv } from 'dotenv';
import path from 'path';

// Import jest-dom matchers for Vitest
import '@testing-library/jest-dom/vitest';

// Load environment variables from .env.local file for tests
loadEnv({ path: path.resolve(__dirname, '.env.local') });

// Mock 'server-only' package used by Next.js for server-only code
// This package throws an error when imported in client code, but in tests
// we need to mock it to allow testing server-side functions
vi.mock('server-only', () => ({}));

// Global mock cleanup to prevent mock bleed between test files
// This fixes issues where tests pass individually but fail when run together
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Avoid launching Chromium during default test runs. Environments without the
// required system libraries can still execute the suite because Puppeteer is
// mocked unless RUN_PDF_TESTS=true is provided.
if (!process.env.RUN_PDF_TESTS) {
  vi.mock('puppeteer', () => {
    const mockPage = {
      setContent: vi.fn(async () => {}),
      pdf: vi.fn(async () => Buffer.from('mock-pdf')),
      evaluate: vi.fn(async () => {}),
      close: vi.fn(async () => {}),
    };

    return {
      default: {
        launch: vi.fn(async () => ({
          newPage: vi.fn(async () => mockPage),
          close: vi.fn(async () => {}),
        })),
      },
    };
  });
}
