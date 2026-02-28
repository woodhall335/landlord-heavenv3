import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const BASE_URL = process.env.BASE_URL ?? 'https://landlordheaven.co.uk';
const IS_LOCALHOST = /^https?:\/\/localhost(?::\d+)?$/i.test(BASE_URL);
const E2E_MODE_ENABLED = process.env.E2E_MODE === 'true';
const STEP_TIMEOUT_MS = Number(process.env.FUNNEL_STEP_TIMEOUT_MS ?? (IS_LOCALHOST ? 25000 : 60000));

const outputRoot = path.join(process.cwd(), 'audit-output/funnel/latest');
const screensDir = path.join(outputRoot, 'screens');
const results = [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sanitizeName = (name) => name.replace(/\s+/g, '-').toLowerCase();
const summarizeError = (error) => (error instanceof Error ? `${error.name}: ${error.message}` : String(error)).slice(0, 280);

async function ensureDirs() {
  await fs.mkdir(screensDir, { recursive: true });
}

async function launchBrowser() {
  const common = { headless: true, defaultViewport: { width: 1440, height: 2200 } };

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return puppeteerCore.launch({ ...common, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, args: ['--no-sandbox'] });
  }

  try {
    return await puppeteer.launch(common);
  } catch {
    const executablePath = await chromium.executablePath();
    return puppeteerCore.launch({ ...common, executablePath, args: [...chromium.args, '--no-sandbox'] });
  }
}

async function screenshot(page, fileName) {
  await page.screenshot({ path: path.join(screensDir, fileName), fullPage: true });
}

async function waitForNonZeroLayout(page) {
  await page.waitForFunction(
    () => document.body && document.body.clientWidth > 0 && document.body.clientHeight > 0,
    { timeout: 5000 },
  );
}

async function safeScreenshot(page, fileName, { diagnostics, stepDiagnostics, stepName } = {}) {
  try {
    await waitForNonZeroLayout(page);
    await screenshot(page, fileName);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (stepDiagnostics) {
      stepDiagnostics.screenshot_skipped = true;
      stepDiagnostics.screenshot_error = message;
    }

    if (diagnostics?.screenshotIssues) {
      diagnostics.screenshotIssues.push({
        screenshot_skipped: true,
        step: stepName ?? 'unknown',
        file: fileName,
        message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

async function waitForAnySelector(page, selectors, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    for (const selector of selectors) {
      // eslint-disable-next-line no-await-in-loop
      const el = await page.$(selector);
      if (el) return selector;
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(200);
  }
  return null;
}

function attachDiagnostics(page) {
  const diagnostics = {
    console: [],
    pageErrors: [],
    failedResponses: [],
    requestFailures: [],
    requests: [],
    screenshotIssues: [],
  };

  page.on('console', (msg) => {
    diagnostics.console.push({
      type: msg.type(),
      text: msg.text().slice(0, 400),
      location: msg.location(),
      timestamp: new Date().toISOString(),
    });
  });

  page.on('pageerror', (error) => {
    diagnostics.pageErrors.push({
      message: error?.message ?? String(error),
      stack: error?.stack?.slice(0, 800),
      timestamp: new Date().toISOString(),
    });
  });

  page.on('response', (response) => {
    if (response.status() >= 400) {
      diagnostics.failedResponses.push({
        status: response.status(),
        url: response.url(),
        timestamp: new Date().toISOString(),
      });
    }
  });


  page.on('request', (request) => {
    diagnostics.requests.push({
      url: request.url(),
      method: request.method(),
      timestamp: new Date().toISOString(),
    });
  });

  page.on('requestfailed', (request) => {
    diagnostics.requestFailures.push({
      url: request.url(),
      method: request.method(),
      reason: request.failure()?.errorText ?? 'unknown',
      timestamp: new Date().toISOString(),
    });
  });

  return diagnostics;
}

async function clickAndRecord({ page, journey, stepName, selectors, expectedUrlIncludes, successWhen, diagnostics }) {
  const stepDiagnostics = {};
  const selectorUsed = await waitForAnySelector(page, selectors, STEP_TIMEOUT_MS);
  if (!selectorUsed) throw new Error(`Missing CTA for ${stepName}: ${selectors.join(' OR ')}`);

  await page.waitForSelector(selectorUsed, { timeout: STEP_TIMEOUT_MS, visible: true });
  let clicked_text = '';
  let clicked_href = '';
  try {
    clicked_text = ((await page.$eval(selectorUsed, (el) => el.textContent || '')) || '').trim();
    clicked_href = (await page.$eval(selectorUsed, (el) => el.getAttribute('href') || '')) || '';
  } catch {
    // If DOM mutates while navigating, diagnostics still capture outcome.
  }
  const url_before = page.url();

  const navPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT_MS }).catch(() => null);
  await page.click(selectorUsed, { timeout: STEP_TIMEOUT_MS });
  await navPromise;

  const url_after = page.url();

  if (expectedUrlIncludes && !url_after.includes(expectedUrlIncludes)) {
    throw new Error(`Unexpected URL after ${stepName}. Expected to include "${expectedUrlIncludes}", got "${url_after}"`);
  }

  if (typeof successWhen === 'function') {
    const ok = await successWhen({ page, url_before, url_after });
    if (!ok) throw new Error(`Custom success check failed for ${stepName}; url_before=${url_before} url_after=${url_after}`);
  } else if (!expectedUrlIncludes && url_after === url_before) {
    throw new Error(`URL did not change after ${stepName}`);
  }

  await safeScreenshot(page, `${journey}_${sanitizeName(stepName)}.png`, { diagnostics, stepDiagnostics, stepName });

  return { step_name: stepName, clicked_text, clicked_href, url_before, url_after, timestamp: new Date().toISOString(), diagnostics: stepDiagnostics };
}

async function createMoneyClaimCase() {
  if (IS_LOCALHOST && E2E_MODE_ENABLED) {
    const response = await fetch(`${BASE_URL}/api/e2e/seed-case`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ product: 'money_claim', jurisdiction: 'england' }),
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`Failed creating case via /api/e2e/seed-case (${response.status})`);
    const body = await response.json();
    if (!body.case_id) throw new Error('Missing case id from /api/e2e/seed-case response');
    return body.case_id;
  }

  const response = await fetch(`${BASE_URL}/api/wizard/start`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ product: 'money_claim', jurisdiction: 'england' }),
    cache: IS_LOCALHOST ? 'no-store' : 'default',
  });

  if (!response.ok) throw new Error(`Failed creating case via /api/wizard/start (${response.status})`);
  const body = await response.json();
  const caseId = body.case_id ?? body.caseId;
  if (!caseId) throw new Error('Missing case id from /api/wizard/start response');
  return caseId;
}

async function runJourney(browser, journey, fn) {
  const started_at = new Date().toISOString();
  const steps = [];
  let currentStep = 'initial_load';
  const page = await browser.newPage();
  const diagnostics = attachDiagnostics(page);

  if (IS_LOCALHOST) {
    await page.setCacheEnabled(false);
  }

  await page.setViewport({ width: 1280, height: 720 });

  try {
    await fn(page, {
      setStep: (step) => {
        currentStep = step;
      },
      steps,
      diagnostics,
    });

    results.push({ journey, status: 'pass', started_at, completed_at: new Date().toISOString(), steps, diagnostics });
  } catch (error) {
    await safeScreenshot(page, `FAIL_${journey}_${sanitizeName(currentStep)}.png`, {
      diagnostics,
      stepName: currentStep,
    });
    const message = summarizeError(error);
    results.push({
      journey,
      status: 'fail',
      started_at,
      completed_at: new Date().toISOString(),
      failed_step: currentStep,
      failed_selector: message.includes('Missing CTA') ? message : undefined,
      error: message,
      steps,
      diagnostics,
    });
  } finally {
    await page.close().catch(() => {});
  }
}

function collectTopErrors() {
  const counts = new Map();

  for (const row of results) {
    const d = row.diagnostics;
    if (!d) continue;

    for (const err of d.pageErrors || []) {
      const key = `pageerror: ${err.message}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    for (const resp of d.failedResponses || []) {
      const key = `http${resp.status}: ${resp.url}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    for (const req of d.requestFailures || []) {
      const key = `requestfailed: ${req.reason} ${req.url}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
}

async function writeOutputs() {
  await ensureDirs();
  await fs.writeFile(path.join(outputRoot, 'funnel_runs.json'), `${JSON.stringify(results, null, 2)}\n`);

  const lines = [
    '# Funnel Audit Summary',
    '',
    `Generated: ${new Date().toISOString()}`,
    `E2E_MODE: ${E2E_MODE_ENABLED ? 'enabled' : 'disabled'}`,
    '',
    '| Journey | Status | Failed step | Details |',
    '|---|---|---|---|',
  ];

  for (const row of results) {
    lines.push(`| ${row.journey} | ${row.status.toUpperCase()} | ${row.failed_step ?? '-'} | ${row.failed_selector ?? row.error ?? 'All steps passed'} |`);
  }

  const failures = results.filter((row) => row.status === 'fail');
  lines.push('', `Total journeys: ${results.length}`, `Failures: ${failures.length}`, '');

  if (failures.length) {
    lines.push('## Failing step details', '');
    for (const fail of failures) {
      lines.push(`- **${fail.journey}** at **${fail.failed_step ?? 'unknown'}**: ${fail.error ?? 'Unknown error'}`);
    }
    lines.push('');
  }

  const screenshotSkips = results.flatMap((row) => row.diagnostics?.screenshotIssues ?? []);
  lines.push('## Screenshot skips', '');
  if (!screenshotSkips.length) {
    lines.push('- No screenshot skips captured.');
  } else {
    for (const skip of screenshotSkips) {
      lines.push(`- ${skip.step}: ${skip.file} (${skip.message})`);
    }
  }
  lines.push('');

  const topErrors = collectTopErrors();
  lines.push('## Top diagnostics', '');
  if (!topErrors.length) {
    lines.push('- No page errors or failing network calls were captured.');
  } else {
    for (const [label, count] of topErrors) {
      lines.push(`- ${count}x ${label}`);
    }
  }

  await fs.writeFile(path.join(outputRoot, 'summary.md'), `${lines.join('\n')}\n`);
}

async function main() {
  await ensureDirs();
  const browser = await launchBrowser();

  try {
    await runJourney(browser, 'journey_a_guide_to_paid', async (page, { setStep, steps, diagnostics }) => {
      setStep('open guide page');
      const guideUrl = `${BASE_URL}/pre-action-protocol-debt`;
      await page.goto(guideUrl, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT_MS });
      await page.waitForSelector('h1, [data-testid="guide-primary-cta"]', { timeout: 15000 });
      await safeScreenshot(page, 'journey_a_guide_to_paid_start.png', { diagnostics, stepName: 'open guide page' });

      setStep('guide primary cta');
      steps.push(await clickAndRecord({
        page,
        journey: 'journey_a_guide_to_paid',
        stepName: 'guide primary cta',
        selectors: ['[data-testid="guide-primary-cta"]', '[data-testid="hero-primary-cta"]'],
        expectedUrlIncludes: '/products/money-claim',
        diagnostics,
      }));
    });

    await runJourney(browser, 'journey_b_tool_to_paid', async (page, { setStep, steps, diagnostics }) => {
      setStep('open tool page');
      await page.goto(`${BASE_URL}/tools/rent-arrears-calculator`, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT_MS });
      await safeScreenshot(page, 'journey_b_tool_to_paid_start.png', { diagnostics, stepName: 'open tool page' });

      setStep('tool upsell cta');
      steps.push(await clickAndRecord({
        page,
        journey: 'journey_b_tool_to_paid',
        stepName: 'tool upsell cta',
        selectors: ['[data-testid="tool-upsell-cta"]', '[data-testid="hero-primary-cta"]'],
        expectedUrlIncludes: '/products/',
        diagnostics,
      }));
    });

    await runJourney(browser, 'journey_c_paid_to_preview_to_checkout_start', async (page, { setStep, steps, diagnostics }) => {
      setStep('open paid product page');
      await page.goto(`${BASE_URL}/products/money-claim`, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT_MS });

      setStep('paid product start wizard');
      steps.push(await clickAndRecord({
        page,
        journey: 'journey_c_paid_to_preview_to_checkout_start',
        stepName: 'paid product start wizard',
        selectors: ['[data-testid="hero-primary-cta"]'],
        expectedUrlIncludes: '/wizard',
        diagnostics,
      }));

      setStep('create wizard case');
      const caseId = await createMoneyClaimCase();

      setStep('open preview page');
      await page.goto(`${BASE_URL}/wizard/preview/${caseId}?product=money_claim`, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT_MS });

      setStep('preview checkout start');
      steps.push(await clickAndRecord({
        page,
        journey: 'journey_c_paid_to_preview_to_checkout_start',
        stepName: 'preview checkout start',
        selectors: ['[data-testid="preview-checkout-cta"]'],
        successWhen: async ({ page, url_before, url_after }) => {
          if (E2E_MODE_ENABLED) {
            return url_after.includes('/checkout/e2e-started');
          }
          if (url_after !== url_before) return true;

          const modalVisible = await waitForAnySelector(page, ['[role="dialog"]', '[data-testid="checkout-modal"]'], 1500);
          const checkoutCallSeen = diagnostics.requests.some((r) => r.url.includes('/api/checkout/create')) ||
            diagnostics.failedResponses.some((r) => r.url.includes('/api/checkout/create'));
          const checkoutMessageSeen = diagnostics.console.some((entry) => entry.text.includes('Checkout'));
          return Boolean(modalVisible || checkoutCallSeen || checkoutMessageSeen);
        },
        diagnostics,
      }));
    });
  } finally {
    await browser.close().catch(() => {});
    await writeOutputs();
  }

  if (results.some((row) => row.status === 'fail')) process.exitCode = 1;
}

main().catch(async (error) => {
  results.push({
    journey: 'global_execution',
    status: 'fail',
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    failed_step: 'bootstrap',
    error: summarizeError(error),
    steps: [],
    diagnostics: { console: [], pageErrors: [], failedResponses: [], requestFailures: [], requests: [] },
  });
  await writeOutputs();
  console.error(error);
  process.exitCode = 1;
});
