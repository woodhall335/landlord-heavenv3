// Vitest global setup
// Additional matchers are not added because we avoid external dependencies in this environment.

import { vi } from 'vitest';
import { config as loadEnv } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local file for tests
loadEnv({ path: path.resolve(__dirname, '.env.local') });

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
