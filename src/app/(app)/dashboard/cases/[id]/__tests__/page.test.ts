import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('case detail page', () => {
  it('does not render Ask Heaven Case Q&A section', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/app/(app)/dashboard/cases/[id]/page.tsx'),
      'utf8'
    );

    expect(source).not.toContain('Ask Heaven â€” Case Q&A');
    expect(source).not.toContain('runAskHeaven');
  });

  it('contains the paid Stage 1 to Stage 2 upgrade CTA and checkout intent', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/app/(app)/dashboard/cases/[id]/page.tsx'),
      'utf8'
    );

    expect(source).toContain('Upgrade this case to the Complete Pack for');
    expect(source).toContain("upgrade_from_product: 'notice_only'");
    expect(source).toContain('Stage 2 unlocked on this same case');
  });

  it('gives completed unpaid cases explicit payment and people-editing actions', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/app/(app)/dashboard/cases/[id]/page.tsx'),
      'utf8'
    );

    expect(source).toContain('Ready to review and pay');
    expect(source).toContain('Answer progress');
    expect(source).toContain('Review documents &amp; pay');
    expect(source).toContain('Review or add people');
    expect(source).toContain('Edit claimants or case details');
    expect(source).toContain('&product=money_claim&step=claimant');
    expect(source).toContain('generated and unlocked after');
    expect(source).toContain('will appear here after successful');
    expect(source).toContain('highlight_sections=landlord,tenants');
    expect(source).toContain('router.push(`/wizard/preview/${caseId}?${previewParams.toString()}`)');
  });
});
