import fs from 'node:fs/promises';
import path from 'node:path';
import { test, expect, type Locator, type Page } from '@playwright/test';

type StepRecord = {
  step_name: string;
  clicked_text: string;
  clicked_href: string;
  url_before: string;
  url_after: string;
  timestamp: string;
};

type JourneyResult = {
  journey: string;
  status: 'pass' | 'fail';
  started_at: string;
  completed_at: string;
  failed_step?: string;
  failed_selector?: string;
  error?: string;
  steps: StepRecord[];
};

const outputRoot = path.join(process.cwd(), 'audit-output/funnel/latest');
const screensDir = path.join(outputRoot, 'screens');

const results: JourneyResult[] = [];

async function ensureOutputDirs() {
  await fs.mkdir(screensDir, { recursive: true });
}

async function assertPageLoaded(page: Page) {
  await expect(page).toHaveURL(/.*/);
  await expect(async () => {
    const title = await page.title();
    const h1Count = await page.locator('h1').count();
    expect(title.length > 0 || h1Count > 0).toBeTruthy();
  }).toPass({ timeout: 15_000 });
}

async function clickAndRecord(params: {
  page: Page;
  journey: string;
  stepName: string;
  locator: Locator;
  selectorHint: string;
  expectedUrlIncludes?: string;
}): Promise<StepRecord> {
  const { page, journey, stepName, locator, expectedUrlIncludes } = params;

  await expect(locator, `Missing CTA for ${stepName}: ${params.selectorHint}`).toBeVisible();
  await expect(locator, `CTA not clickable for ${stepName}: ${params.selectorHint}`).toBeEnabled();

  const clicked_text = ((await locator.first().innerText()) || '').trim();
  const clicked_href = (await locator.first().getAttribute('href')) ?? '';
  const url_before = page.url();

  await locator.first().click();

  if (expectedUrlIncludes) {
    await expect(page).toHaveURL(new RegExp(expectedUrlIncludes.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  } else {
    await expect(page).not.toHaveURL(url_before);
  }

  await assertPageLoaded(page);

  const shotPath = path.join(screensDir, `${journey}_${stepName.replace(/\s+/g, '-').toLowerCase()}.png`);
  await page.screenshot({ path: shotPath, fullPage: true });

  return {
    step_name: stepName,
    clicked_text,
    clicked_href,
    url_before,
    url_after: page.url(),
    timestamp: new Date().toISOString(),
  };
}

async function createMoneyClaimCase(page: Page): Promise<string> {
  const response = await page.request.post('/api/wizard/start', {
    data: {
      product: 'money_claim',
      jurisdiction: 'england',
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed creating case via /api/wizard/start (${response.status()})`);
  }

  const body = (await response.json()) as { case_id?: string; caseId?: string };
  const caseId = body.case_id ?? body.caseId;
  if (!caseId) {
    throw new Error('Missing case id from /api/wizard/start response');
  }

  return caseId;
}

async function writeOutputs() {
  await ensureOutputDirs();
  await fs.writeFile(path.join(outputRoot, 'funnel_runs.json'), JSON.stringify(results, null, 2));

  const lines: string[] = [
    '# Funnel Audit Summary',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '| Journey | Status | Broken step | Details |',
    '|---|---|---|---|',
  ];

  for (const result of results) {
    lines.push(
      `| ${result.journey} | ${result.status.toUpperCase()} | ${result.failed_step ?? '-'} | ${result.failed_selector ?? result.error ?? '-'} |`,
    );
  }

  await fs.writeFile(path.join(outputRoot, 'summary.md'), `${lines.join('\n')}\n`);
}

test.afterAll(async () => {
  await writeOutputs();
});

test('funnel audit journeys (stop before payment)', async ({ page }) => {
  await ensureOutputDirs();

  const run = async (
    journey: string,
    fn: (steps: StepRecord[]) => Promise<void>,
  ) => {
    const started_at = new Date().toISOString();
    const steps: StepRecord[] = [];

    try {
      await fn(steps);
      results.push({
        journey,
        status: 'pass',
        started_at,
        completed_at: new Date().toISOString(),
        steps,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const failed_step = steps[steps.length - 1]?.step_name ?? 'initial_load';
      results.push({
        journey,
        status: 'fail',
        started_at,
        completed_at: new Date().toISOString(),
        failed_step,
        failed_selector: message.includes('Missing CTA') || message.includes('not clickable') ? message : undefined,
        error: message,
        steps,
      });
    }
  };

  await run('journey_a_guide_to_paid', async (steps) => {
    await page.goto('/pre-action-protocol-debt');
    await assertPageLoaded(page);
    await page.screenshot({ path: path.join(screensDir, 'journey_a_guide_to_paid_start.png'), fullPage: true });

    steps.push(await clickAndRecord({
      page,
      journey: 'journey_a_guide_to_paid',
      stepName: 'guide primary cta',
      locator: page.getByTestId('guide-primary-cta'),
      selectorHint: '[data-testid="guide-primary-cta"]',
      expectedUrlIncludes: '/products/money-claim',
    }));
  });

  await run('journey_b_tool_to_paid', async (steps) => {
    await page.goto('/tools/rent-arrears-calculator');
    await assertPageLoaded(page);
    await page.screenshot({ path: path.join(screensDir, 'journey_b_tool_to_paid_start.png'), fullPage: true });

    steps.push(await clickAndRecord({
      page,
      journey: 'journey_b_tool_to_paid',
      stepName: 'tool upsell cta',
      locator: page.getByTestId('tool-upsell-cta'),
      selectorHint: '[data-testid="tool-upsell-cta"]',
      expectedUrlIncludes: '/products/',
    }));
  });

  await run('journey_c_paid_to_preview_to_checkout_start', async (steps) => {
    await page.goto('/products/money-claim');
    await assertPageLoaded(page);

    steps.push(await clickAndRecord({
      page,
      journey: 'journey_c_paid_to_preview_to_checkout_start',
      stepName: 'paid product start wizard',
      locator: page.getByTestId('hero-primary-cta'),
      selectorHint: '[data-testid="hero-primary-cta"]',
      expectedUrlIncludes: '/wizard',
    }));

    const caseId = await createMoneyClaimCase(page);

    await page.goto(`/wizard/preview/${caseId}?product=money_claim`);
    await assertPageLoaded(page);

    // Do not submit payment; only verify checkout starts from CTA click.
    steps.push(await clickAndRecord({
      page,
      journey: 'journey_c_paid_to_preview_to_checkout_start',
      stepName: 'preview checkout start',
      locator: page.getByTestId('preview-checkout-cta'),
      selectorHint: '[data-testid="preview-checkout-cta"]',
    }));
  });

  const failed = results.filter((r) => r.status === 'fail');
  expect(failed, `Failed journeys: ${failed.map((f) => `${f.journey}:${f.failed_step}:${f.error}`).join(' | ')}`).toHaveLength(0);
});
