import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('Phase 1 commercial positioning', () => {
  it('repositions AST, Notice Only, and Money Claim heroes away from broad-owner claims', () => {
    const source = readSource('src/components/landing/heroConfigs.tsx');

    expect(source).toContain("title: 'Create the Right'");
    expect(source).toContain("highlightTitle: 'Tenancy Agreement for Your England Let'");
    expect(source).toContain("title: 'Recover Unpaid Rent'");
    expect(source).toContain("highlightTitle: 'and Prepare Your Money Claim Pack'");

    expect(source).not.toContain("highlightTitle: 'Eviction Notice UK?'");
    expect(source).not.toContain("title: 'Tenant Not Paying Rent?'");
  });

  it('updates Notice Only and Complete Pack value framing for the new pricing and service position', () => {
    const noticeSource = readSource('src/app/(marketing)/products/notice-only/page.tsx');
    const completePackSource = readSource('src/app/(marketing)/products/complete-pack/page.tsx');
    const rentIncreaseHubSource = readSource('src/app/rent-increase/page.tsx');

    expect(noticeSource).toContain('Solicitor-approved Section 8 notice and service file');
    expect(noticeSource).toContain('Prepare the notice file properly before anything goes to the tenant');
    expect(noticeSource).toContain('Form 3A Section 8 notice, N215 certificate of service, and service instructions');

    expect(completePackSource).toContain('Solicitor-approved Section 8 court and possession file');
    expect(completePackSource).toContain('Prepare the full possession file, not just the court forms');
    expect(completePackSource).toContain('/images/complete-stage-desktop.webp');
    expect(completePackSource).toContain('N5, N119, witness statement, court readiness status, and evidence collection checklist');

    expect(rentIncreaseHubSource).toContain("reviewPillLayout: 'stacked'");
  });

  it('keeps money-claim product copy transactional rather than broad-owner led', () => {
    const source = readSource('src/app/(marketing)/products/money-claim/page.tsx');

    expect(source).toContain('Prepare a landlord money claim pack');
    expect(source).toContain('<GoldenPackProof data={sampleProof}');
    expect(source).not.toContain('What is included in the Money Claim Pack');
    expect(source).toContain('/images/money-claim-desktop.webp');
    expect(source).toContain('/images/money-claim-mobile.webp');
    expect(source).toContain('/images/money-claim-wizard.webp');
    expect(source).toContain("imageSrc: '/images/money-claim-selector.webp'");
    expect(source).toContain("imageSrc: '/images/section-8-court-paperwork.webp'");
  });

  it('removes England-default routing to old notice aliases and regional tenancy aliases from high-prominence surfaces', () => {
    const homeSource = readSource('src/components/landing/HomeContent.tsx');
    const footerSource = readSource('src/components/layout/Footer.tsx');

    expect(homeSource).not.toContain('/eviction-notice-uk');
    expect(homeSource).not.toContain('Generate court-ready landlord documents for the right UK jurisdiction');

    expect(footerSource).not.toContain('/tenancy-agreements/wales');
    expect(footerSource).not.toContain('/tenancy-agreements/scotland');
    expect(footerSource).not.toContain('/tenancy-agreements/northern-ireland');
  });
});
