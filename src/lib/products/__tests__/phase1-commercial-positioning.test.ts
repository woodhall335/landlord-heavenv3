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
    expect(source).toContain("highlightTitle: 'and Start Your Money Claim Pack'");

    expect(source).not.toContain("highlightTitle: 'Eviction Notice UK?'");
    expect(source).not.toContain("title: 'Tenant Not Paying Rent?'");
  });

  it('updates Notice Only and Complete Pack value framing for the new pricing and service position', () => {
    const noticeSource = readSource('src/app/(marketing)/products/notice-only/page.tsx');
    const completePackSource = readSource('src/app/(marketing)/products/complete-pack/page.tsx');

    expect(noticeSource).toContain('start correctly before court');
    expect(noticeSource).toContain('the next practical step is serving notice');
    expect(noticeSource).toContain('serve-first route');

    expect(completePackSource).toContain('includes Stage 1 notice and Stage 2 court paperwork together');
    expect(completePackSource).toContain('The Complete Pack already includes the full Stage 1 Section 8 notice and service file');
    expect(completePackSource).toContain('N5, N119, witness statement, and court bundle support added from the start');
  });

  it('keeps money-claim product copy transactional rather than broad-owner led', () => {
    const source = readSource('src/app/(marketing)/products/money-claim/page.tsx');

    expect(source).toContain('Start a landlord money claim pack');
    expect(source).toContain('What is included in the Money Claim Pack');
    expect(source).toContain('Choose this pack when the next job is recovering money');
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
