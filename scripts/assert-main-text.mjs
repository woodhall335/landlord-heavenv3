#!/usr/bin/env node

const BASE_URL = (process.env.SEO_AUDIT_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
const PATHS = [
  '/',
  '/products/complete-pack',
  '/products/notice-only',
  '/products/money-claim',
  '/tenancy-agreement-template',
];

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getMainTextLength(pathname) {
  const res = await fetch(`${BASE_URL}${pathname}`, {
    headers: {
      'user-agent': 'SEO-Main-Text-Regression-Check/1.0',
      accept: 'text/html',
    },
  });

  if (!res.ok) {
    throw new Error(`${pathname} returned ${res.status}`);
  }

  const html = await res.text();
  const match = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!match) {
    throw new Error(`${pathname} has no <main> element in HTML response`);
  }

  const textContent = stripTags(match[1]);
  return textContent.length;
}

async function run() {
  const failures = [];

  for (const pathname of PATHS) {
    const length = await getMainTextLength(pathname);
    const pass = length > 200;
    console.log(`${pass ? 'PASS' : 'FAIL'} ${pathname} main text length: ${length}`);

    if (!pass) {
      failures.push(`${pathname} text length ${length} <= 200`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Main text regression check failed:\n- ${failures.join('\n- ')}`);
  }
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
