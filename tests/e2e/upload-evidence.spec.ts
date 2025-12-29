import path from 'path';
import { describe, it } from 'vitest';

const caseId = process.env.E2E_CASE_ID;
const playwright = await import('@playwright/test').catch(() => null);

if (!playwright) {
  describe('upload evidence (notice only)', () => {
    it.skip('requires @playwright/test', () => {});
  });
} else if (!caseId) {
  const { test } = playwright;

  test.describe('upload evidence (notice only)', () => {
    test.skip(true, 'E2E_CASE_ID not set');
    test('skipped', async () => {});
  });
} else {
  const { test, expect } = playwright;

  test.describe('upload evidence (notice only)', () => {
    test('shows validation summary after upload', async ({ page }) => {
      const filePath = path.resolve('tests/fixtures/sample.pdf');
      const url = `/wizard/flow?type=eviction&jurisdiction=scotland&product=notice_only&case_id=${caseId}&mode=edit&jump_to=evidence_uploads`;

      await page.goto(url);
      await page.waitForTimeout(1000);

      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeVisible();
      await fileInput.setInputFiles(filePath);

      await expect(page.getByText('Validation status')).toBeVisible({ timeout: 20000 });
    });
  });
}
