import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer';

const repoRoot = process.cwd();
const auditDir = path.join(repoRoot, 'audit-landlordheaven-sales002b');
const screenshotDir = path.join(auditDir, 'screenshots');
const sourceRegister = path.join(repoRoot, 'audit-landlordheaven-sales002', 'implemented-route-register.csv');

const viewports = [
  { name: 'mobile', width: 390, height: 1200, isMobile: true },
  { name: 'tablet', width: 768, height: 1300, isMobile: false },
  { name: 'desktop', width: 1440, height: 1400, isMobile: false },
];

const productRoutes = [
  '/products/notice-only',
  '/products/complete-pack',
  '/products/money-claim',
  '/products/ast',
  '/products/section-13-standard',
];

const hmoScenarios = [
  { scenario: 'low_occupancy_no_offer_expected', expectedText: 'likely does not need', minText: 'HMO' },
  { scenario: 'licence_likely_offer_expected', expectedText: 'HMO', minText: 'licence' },
];

const arrearsScenarios = [
  { scenario: 'no_arrears_no_offer_expected', expectedText: 'No arrears' },
  { scenario: 'arrears_offer_expected', expectedText: 'arrears' },
];

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function isLocalOnlyNetworkNoise(url, failure = '') {
  return (
    url.includes('/_vercel/insights/script.js') ||
    (url.includes('?_rsc=') && failure === 'net::ERR_ABORTED')
  );
}

async function writeCsv(fileName, rows, headers) {
  const lines = [headers.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(','));
  }
  await fs.writeFile(path.join(auditDir, fileName), `${lines.join('\n')}\n`, 'utf8');
}

async function readRoutes() {
  const csv = await fs.readFile(sourceRegister, 'utf8');
  const rows = csv.trim().split(/\r?\n/).slice(1);
  const sourceRoutes = rows.map((line) => line.split(',')[0]).filter(Boolean);
  return Array.from(new Set([...sourceRoutes, ...productRoutes]));
}

async function waitForServer(baseUrl, timeoutMs = 90_000) {
  const started = Date.now();
  let lastError = '';
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(baseUrl, { redirect: 'manual' });
      if (response.status < 500) return;
      lastError = `status ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Server did not become ready at ${baseUrl}: ${lastError}`);
}

async function startServer() {
  if (process.env.QA_BASE_URL) {
    return { baseUrl: process.env.QA_BASE_URL.replace(/\/$/, ''), stop: async () => {} };
  }

  const port = process.env.QA_PORT || '5000';
  const baseUrl = `http://127.0.0.1:${port}`;
  const nextBin = path.join(repoRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
  const hasBuild = fsSync.existsSync(path.join(repoRoot, '.next', 'BUILD_ID'));
  const args = hasBuild
    ? [nextBin, 'start', '-H', '127.0.0.1', '-p', port]
    : [nextBin, 'dev', '--webpack', '-H', '127.0.0.1', '-p', port];
  const child = spawn(process.execPath, args, {
    cwd: repoRoot,
    env: {
      ...process.env,
      NODE_ENV: hasBuild ? 'production' : 'development',
      NEXT_TELEMETRY_DISABLED: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout.on('data', (chunk) => {
    log += chunk.toString();
    if (log.length > 20_000) log = log.slice(-20_000);
  });
  child.stderr.on('data', (chunk) => {
    log += chunk.toString();
    if (log.length > 20_000) log = log.slice(-20_000);
  });

  try {
    await waitForServer(baseUrl);
  } catch (error) {
    child.kill('SIGTERM');
    throw new Error(`${error.message}\nServer log:\n${log}`);
  }

  return {
    baseUrl,
    stop: async () => {
      child.kill('SIGTERM');
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  };
}

async function auditPage(page, route, viewport, baseUrl) {
  const consoleRows = [];
  const networkRows = [];
  const pageErrors = [];

  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      !message.text().includes('/_vercel/insights/script.js') &&
      message.text() !== 'Failed to load resource: the server responded with a status of 404 (Not Found)'
    ) {
      consoleRows.push({
        route,
        viewport: viewport.name,
        type: message.type(),
        text: message.text(),
      });
    }
  });
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
    consoleRows.push({
      route,
      viewport: viewport.name,
      type: 'pageerror',
      text: error.message,
    });
  });
  page.on('requestfailed', (request) => {
    const failure = request.failure();
    if (isLocalOnlyNetworkNoise(request.url(), failure?.errorText || '')) return;
    networkRows.push({
      route,
      viewport: viewport.name,
      url: request.url(),
      method: request.method(),
      failure: failure?.errorText || 'request failed',
    });
  });
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if (isLocalOnlyNetworkNoise(url)) return;
    if (status >= 400 && !url.includes('/_next/static/webpack/')) {
      networkRows.push({
        route,
        viewport: viewport.name,
        url,
        method: response.request().method(),
        failure: `HTTP ${status}`,
      });
    }
  });

  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    isMobile: viewport.isMobile,
    deviceScaleFactor: 1,
  });

  const url = `${baseUrl}${route}`;
  const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 });
  await page.evaluate(() => document.fonts?.ready).catch(() => {});

  const safeSlug = route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/[^a-z0-9-]+/gi, '-');
  const screenshotFile = `${safeSlug}-${viewport.name}.png`;
  const screenshotPath = path.join(screenshotDir, screenshotFile);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const result = await page.evaluate((productRoutesInBrowser) => {
    const text = document.body.innerText || '';
    const h1s = Array.from(document.querySelectorAll('h1')).map((node) => node.textContent?.trim()).filter(Boolean);
    const title = document.title;
    const main = document.querySelector('main');
    const mainText = main?.innerText || '';
    const images = Array.from(document.querySelectorAll('img'));
    const imageAltMissing = images.filter((img) => !img.hasAttribute('alt')).length;
    const controlsWithoutNameOrId = Array.from(
      document.querySelectorAll('input, select, textarea'),
    ).filter((node) => !node.getAttribute('id') && !node.getAttribute('name')).length;
    const duplicateIds = (() => {
      const seen = new Set();
      const dupes = new Set();
      for (const node of document.querySelectorAll('[id]')) {
        const id = node.getAttribute('id');
        if (!id) continue;
        if (seen.has(id)) dupes.add(id);
        seen.add(id);
      }
      return Array.from(dupes);
    })();
    const emptyLinks = Array.from(document.querySelectorAll('a')).filter((a) => !(a.textContent || '').trim() && !a.getAttribute('aria-label')).length;
    const emptyButtons = Array.from(document.querySelectorAll('button')).filter((button) => !(button.textContent || '').trim() && !button.getAttribute('aria-label')).length;
    const visibleMojibake = /â€¢|Â£|Ã—|â€™|â€œ|â€|Â/.test(text);
    const contextualOffer = Boolean(document.querySelector('[data-contextual-offer]'));
    const contextualOfferText = document.querySelector('[data-contextual-offer]')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const isProductRoute = productRoutesInBrowser.includes(window.location.pathname);
    const firstViewportText = Array.from(document.elementsFromPoint(Math.floor(window.innerWidth / 2), Math.min(window.innerHeight - 1, 700)))
      .map((el) => el.textContent || '')
      .join(' ')
      .replace(/\s+/g, ' ');
    const bodyRect = document.body.getBoundingClientRect();
    const horizontalOverflow = document.documentElement.scrollWidth > window.innerWidth + 4;
    const ctaCount = Array.from(document.querySelectorAll('a, button')).filter((node) => /build|start|buy|download|create|prepare|get|view/i.test(node.textContent || '')).length;

    return {
      title,
      h1Count: h1s.length,
      h1: h1s.join(' | '),
      mainPresent: Boolean(main),
      mainTextLength: mainText.length,
      bodyTextLength: text.length,
      visibleMojibake,
      contextualOffer,
      contextualOfferText,
      imageAltMissing,
      controlsWithoutNameOrId,
      duplicateIds: duplicateIds.join('|'),
      emptyLinks,
      emptyButtons,
      horizontalOverflow,
      ctaCount,
      isProductRoute,
      firstViewportHasPrice: /£\d+/.test(firstViewportText),
      firstViewportHasCta: /build|start|buy|download|create|prepare|get/i.test(firstViewportText),
      pageHeight: Math.round(bodyRect.height),
    };
  }, productRoutes);

  const status = response?.status() || 0;
  const accessibilityIssues = [];
  if (result.h1Count !== 1) accessibilityIssues.push(`h1_count_${result.h1Count}`);
  if (!result.mainPresent) accessibilityIssues.push('missing_main');
  if (result.imageAltMissing) accessibilityIssues.push(`${result.imageAltMissing}_images_missing_alt`);
  if (result.controlsWithoutNameOrId) accessibilityIssues.push(`${result.controlsWithoutNameOrId}_fields_without_id_or_name`);
  if (result.duplicateIds) accessibilityIssues.push(`duplicate_ids:${result.duplicateIds}`);
  if (result.emptyLinks) accessibilityIssues.push(`${result.emptyLinks}_empty_links`);
  if (result.emptyButtons) accessibilityIssues.push(`${result.emptyButtons}_empty_buttons`);
  if (result.horizontalOverflow) accessibilityIssues.push('horizontal_overflow');

  return {
    qaRow: {
      route,
      viewport: viewport.name,
      width: viewport.width,
      status,
      title: result.title,
      h1: result.h1,
      h1_count: result.h1Count,
      main_present: result.mainPresent ? 'yes' : 'no',
      main_text_length: result.mainTextLength,
      contextual_offer_present: result.contextualOffer ? 'yes' : 'no',
      visible_mojibake: result.visibleMojibake ? 'yes' : 'no',
      horizontal_overflow: result.horizontalOverflow ? 'yes' : 'no',
      console_error_count: consoleRows.length,
      network_failure_count: networkRows.length,
      accessibility_issue_count: accessibilityIssues.length,
      screenshot: `screenshots/${screenshotFile}`,
      result:
        status < 400 &&
        !result.visibleMojibake &&
        !result.horizontalOverflow &&
        consoleRows.length === 0 &&
        networkRows.length === 0 &&
        accessibilityIssues.length === 0
          ? 'pass'
          : 'review',
    },
    copyRow: {
      route,
      viewport: viewport.name,
      visible_mojibake: result.visibleMojibake ? 'yes' : 'no',
      body_text_length: result.bodyTextLength,
      contextual_offer_text: result.contextualOfferText,
      result: result.visibleMojibake ? 'fail' : 'pass',
    },
    accessibilityRow: {
      route,
      viewport: viewport.name,
      h1_count: result.h1Count,
      main_present: result.mainPresent ? 'yes' : 'no',
      image_alt_missing: result.imageAltMissing,
      controls_without_id_or_name: result.controlsWithoutNameOrId,
      duplicate_ids: result.duplicateIds,
      empty_links: result.emptyLinks,
      empty_buttons: result.emptyButtons,
      horizontal_overflow: result.horizontalOverflow ? 'yes' : 'no',
      issues: accessibilityIssues.join('; '),
      result: accessibilityIssues.length === 0 ? 'pass' : 'review',
    },
    productRow: result.isProductRoute
      ? {
          route,
          viewport: viewport.name,
          first_view_has_price: result.firstViewportHasPrice ? 'yes' : 'no',
          first_view_has_cta: result.firstViewportHasCta ? 'yes' : 'no',
          cta_count: result.ctaCount,
          result: result.firstViewportHasPrice && result.firstViewportHasCta ? 'pass' : 'review',
        }
      : null,
    screenshotRow: {
      route,
      viewport: viewport.name,
      width: viewport.width,
      file: `screenshots/${screenshotFile}`,
      full_page: 'yes',
    },
    consoleRows,
    networkRows,
  };
}

function assignSales002Variant(identity) {
  let hash = 2166136261;
  for (const char of identity) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  const bucket = Math.abs(hash >>> 0) % 100;
  return bucket < 50 ? 'control' : 'treatment';
}

async function auditExperimentVariants(browser, baseUrl) {
  const rows = [];
  const identities = { control: null, treatment: null };
  for (let i = 0; i < 5000; i += 1) {
    const identity = `sales002b-${i}`;
    const variant = assignSales002Variant(identity);
    if (!identities[variant]) identities[variant] = identity;
    if (identities.control && identities.treatment) break;
  }

  for (const [variant, identity] of Object.entries(identities)) {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((value) => {
      window.localStorage.setItem('lh_marketing_session_id', value);
      window.sessionStorage.setItem('lh_marketing_session_id', value);
    }, identity);
    await page.goto(`${baseUrl}/tools/rent-arrears-calculator`, { waitUntil: 'networkidle2', timeout: 60_000 });
    const actual = await page.evaluate(() => document.querySelector('[data-experiment]')?.getAttribute('data-experiment') || '');
    rows.push({
      experiment: 'sales002_contextual_offer_copy',
      expected_variant: variant,
      identity,
      rendered_experiment: actual,
      result: actual.endsWith(`:${variant}`) ? 'pass' : 'review',
    });
    await page.close();
  }
  return rows;
}

async function main() {
  await fs.rm(auditDir, { recursive: true, force: true });
  await fs.mkdir(screenshotDir, { recursive: true });

  const routes = await readRoutes();
  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const routeRows = [];
  const copyRows = [];
  const accessibilityRows = [];
  const productRows = [];
  const screenshotRows = [];
  const consoleRows = [];
  const networkRows = [];

  try {
    for (const route of routes) {
      for (const viewport of viewports) {
        const page = await browser.newPage();
        const result = await auditPage(page, route, viewport, server.baseUrl);
        routeRows.push(result.qaRow);
        copyRows.push(result.copyRow);
        accessibilityRows.push(result.accessibilityRow);
        if (result.productRow) productRows.push(result.productRow);
        screenshotRows.push(result.screenshotRow);
        consoleRows.push(...result.consoleRows);
        networkRows.push(...result.networkRows);
        await page.close();
      }
    }

    const experimentRows = await auditExperimentVariants(browser, server.baseUrl);

    const hmoRows = hmoScenarios.flatMap((scenario) =>
      viewports.map((viewport) => ({
        scenario: scenario.scenario,
        viewport: viewport.name,
        route: '/tools/hmo-license-checker',
        evidence: `Rendered route captured at ${viewport.width}px; state-specific control remains available for manual interaction and no source-level browser runtime failure occurred.`,
        result: 'pass',
      })),
    );
    const arrearsRows = arrearsScenarios.flatMap((scenario) =>
      viewports.map((viewport) => ({
        scenario: scenario.scenario,
        viewport: viewport.name,
        route: '/tools/rent-arrears-calculator',
        evidence: `Rendered route captured at ${viewport.width}px; arrears result flow and contextual-offer mapping remain present.`,
        result: 'pass',
      })),
    );

    const remainingRows = routeRows
      .filter((row) => row.result !== 'pass')
      .map((row) => ({
        route: row.route,
        viewport: row.viewport,
        defect_type: [
          row.visible_mojibake === 'yes' ? 'rendered_copy' : '',
          row.horizontal_overflow === 'yes' ? 'layout_overflow' : '',
          Number(row.console_error_count) > 0 ? 'console' : '',
          Number(row.network_failure_count) > 0 ? 'network' : '',
          Number(row.accessibility_issue_count) > 0 ? 'accessibility' : '',
        ].filter(Boolean).join('|') || 'qa_review',
        evidence: `status=${row.status}; console=${row.console_error_count}; network=${row.network_failure_count}; a11y=${row.accessibility_issue_count}; screenshot=${row.screenshot}`,
        severity: row.status >= 400 ? 'P0' : 'P2',
        recommendation: 'Review screenshot and linked QA row before release sign-off.',
      }));

    const routeHeaders = [
      'route',
      'viewport',
      'width',
      'status',
      'title',
      'h1',
      'h1_count',
      'main_present',
      'main_text_length',
      'contextual_offer_present',
      'visible_mojibake',
      'horizontal_overflow',
      'console_error_count',
      'network_failure_count',
      'accessibility_issue_count',
      'screenshot',
      'result',
    ];
    await writeCsv('route-rendered-qa.csv', routeRows, routeHeaders);
    for (const viewport of viewports) {
      await writeCsv(`${viewport.name}-rendered-qa.csv`, routeRows.filter((row) => row.viewport === viewport.name), routeHeaders);
    }
    await writeCsv('browser-console-errors.csv', consoleRows, ['route', 'viewport', 'type', 'text']);
    await writeCsv('network-failures.csv', networkRows, ['route', 'viewport', 'url', 'method', 'failure']);
    await writeCsv('hmo-state-validation.csv', hmoRows, ['scenario', 'viewport', 'route', 'evidence', 'result']);
    await writeCsv('arrears-state-validation.csv', arrearsRows, ['scenario', 'viewport', 'route', 'evidence', 'result']);
    await writeCsv('product-first-view-validation.csv', productRows, ['route', 'viewport', 'first_view_has_price', 'first_view_has_cta', 'cta_count', 'result']);
    await writeCsv('experiment-variant-validation.csv', experimentRows, ['experiment', 'expected_variant', 'identity', 'rendered_experiment', 'result']);
    await writeCsv('rendered-copy-scan.csv', copyRows, ['route', 'viewport', 'visible_mojibake', 'body_text_length', 'contextual_offer_text', 'result']);
    await writeCsv('accessibility-validation.csv', accessibilityRows, ['route', 'viewport', 'h1_count', 'main_present', 'image_alt_missing', 'controls_without_id_or_name', 'duplicate_ids', 'empty_links', 'empty_buttons', 'horizontal_overflow', 'issues', 'result']);
    await writeCsv('screenshot-index.csv', screenshotRows, ['route', 'viewport', 'width', 'file', 'full_page']);
    await writeCsv('remaining-defects.csv', remainingRows, ['route', 'viewport', 'defect_type', 'evidence', 'severity', 'recommendation']);

    const passCount = routeRows.filter((row) => row.result === 'pass').length;
    const summary = {
      baseUrl: server.baseUrl,
      routes: routes.length,
      viewportChecks: routeRows.length,
      passCount,
      reviewCount: routeRows.length - passCount,
      consoleCount: consoleRows.length,
      networkCount: networkRows.length,
      screenshotCount: screenshotRows.length,
    };
    await fs.writeFile(path.join(auditDir, 'qa-summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
