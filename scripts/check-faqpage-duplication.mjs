#!/usr/bin/env node
import { spawn } from 'node:child_process';

const routes = ['/products/money-claim', '/products/ast'];
const baseUrl = 'http://127.0.0.1:5000';
const pattern = /"@type"\s*:\s*"FAQPage"/g;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/`);
      if (res.ok || res.status === 404) return;
    } catch {
      // ignore while waiting
    }
    await sleep(500);
  }
  throw new Error('Timed out waiting for Next.js server to start');
}

async function main() {
  const server = spawn('pnpm', ['dev'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: '5000' },
  });

  server.stdout.on('data', (chunk) => process.stdout.write(`[start] ${chunk}`));
  server.stderr.on('data', (chunk) => process.stderr.write(`[start] ${chunk}`));

  try {
    await waitForServer();

    for (const route of routes) {
      const res = await fetch(`${baseUrl}${route}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${route}: HTTP ${res.status}`);
      }

      const html = await res.text();
      const matches = html.match(pattern) ?? [];
      if (matches.length !== 1) {
        throw new Error(`Expected exactly 1 FAQPage schema on ${route}, found ${matches.length}`);
      }

      console.log(`✔ ${route}: found exactly one FAQPage schema`);
    }

    console.log('All checked routes contain exactly one FAQPage schema.');
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
