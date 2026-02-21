import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const BASE_URL = process.env.BASE_URL ?? 'https://landlordheaven.co.uk';
const IS_LOCALHOST = /^https?:\/\/localhost(?::\d+)?$/i.test(BASE_URL);
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

async function clickAndRecord({ page, journey, stepName, selectors, expectedUrlIncludes }) {
  const selectorUsed = await waitForAnySelector(page, selectors, STEP_TIMEOUT_MS);
  if (!selectorUsed) throw new Error(`Missing CTA for ${stepName}: ${selectors.join(' OR ')}`);

  await page.waitForSelector(selectorUsed, { timeout: STEP_TIMEOUT_MS, visible: true });
  const clicked_text = ((await page.$eval(selectorUsed, (el) => el.textContent || '')) || '').trim();
  const clicked_href = (await page.$eval(selectorUsed, (el) => el.getAttribute('href') || '')) || '';
  const url_before = page.url();

  const navPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT_MS }).catch(() => null);
  await page.click(selectorUsed, { timeout: STEP_TIMEOUT_MS });
  await navPromise;

  const url_after = page.url();
  if (expectedUrlIncludes && !url_after.includes(expectedUrlIncludes)) {
    throw new Error(`Unexpected URL after ${stepName}. Expected to include "${expectedUrlIncludes}", got "${url_after}"`);
  }
  if (!expectedUrlIncludes && url_after === url_before) {
    throw new Error(`URL did not change after ${stepName}`);
  }

  await screenshot(page, `${journey}_${sanitizeName(stepName)}.png`);

  return { step_name: stepName, clicked_text, clicked_href, url_before, url_after, timestamp: new Date().toISOString() };
}

async function createMoneyClaimCase() {
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

  if (IS_LOCALHOST) {
    await page.setCacheEnabled(false);
  }

  try {
    await fn(page, {
      setStep: (step) => {
        currentStep = step;
      },
      steps,
    });

    results.push({ journey, status: 'pass', started_at, completed_at: new Date().toISOString(), steps });
  } catch (error) {
    await screenshot(page, `FAIL_${journey}_${sanitizeName(currentStep)}.png`).catch(() => {});
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
    });
  } finally {
    await page.close().catch(() => {});
  }
}

async function writeOutputs() {
  await ensureDirs();
  await fs.writeFile(path.join(outputRoot, 'funnel_runs.json'), `${JSON.stringify(results, null, 2)}\n`);

  const lines = [
    '# Funnel Audit Summary',
    '',
    `Generated: ${new Date().toISOString()}`,
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
  }

  await fs.writeFile(path.join(outputRoot, 'summary.md'), `${lines.join('\n')}\n`);
}

async function main() {
  await ensureDirs();
  const browser = await launchBrowser();

  try {
    await runJourney(browser, 'journey_a_guide_to_paid', async (page, { setStep, steps }) => {
      setStep('open guide page');
      await page.goto(`${BASE_URL}/pre-action-protocol-debt`, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT_MS });
      await screenshot(page, 'journey_a_guide_to_paid_start.png');

      setStep('guide primary cta');
      steps.push(await clickAndRecord({
        page,
        journey: 'journey_a_guide_to_paid',
        stepName: 'guide primary cta',
        selectors: ['[data-testid="guide-primary-cta"]', '[data-testid="hero-primary-cta"]'],
        expectedUrlIncludes: '/products/money-claim',
      }));
    });

    await runJourney(browser, 'journey_b_tool_to_paid', async (page, { setStep, steps }) => {
      setStep('open tool page');
      await page.goto(`${BASE_URL}/tools/rent-arrears-calculator`, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT_MS });
      await screenshot(page, 'journey_b_tool_to_paid_start.png');

      setStep('tool upsell cta');
      steps.push(await clickAndRecord({
        page,
        journey: 'journey_b_tool_to_paid',
        stepName: 'tool upsell cta',
        selectors: ['[data-testid="tool-upsell-cta"]', '[data-testid="hero-primary-cta"]'],
        expectedUrlIncludes: '/products/',
      }));
    });

    await runJourney(browser, 'journey_c_paid_to_preview_to_checkout_start', async (page, { setStep, steps }) => {
      setStep('open paid product page');
      await page.goto(`${BASE_URL}/products/money-claim`, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT_MS });

      setStep('paid product start wizard');
      steps.push(await clickAndRecord({
        page,
        journey: 'journey_c_paid_to_preview_to_checkout_start',
        stepName: 'paid product start wizard',
        selectors: ['[data-testid="hero-primary-cta"]'],
        expectedUrlIncludes: '/wizard',
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
  });
  await writeOutputs();
  console.error(error);
  process.exitCode = 1;
});
