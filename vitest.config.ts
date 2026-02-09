import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // Use jsdom for component tests
    environmentMatchGlobs: [
      ['tests/components/**', 'jsdom'],
    ],
    // Isolate test files to prevent mock bleed between files
    // Each test file runs with fresh module state
    isolate: true,
    // Use threads pool for better isolation
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
      },
    },
  },
  resolve: {
    alias: [
      {
        find: 'server-only',
        replacement: path.resolve(__dirname, './tests/__mocks__/server-only.ts'),
      },
      {
        find: '@/config',
        replacement: path.resolve(__dirname, './config'),
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },
});
