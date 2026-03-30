import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('Phase 1 commercial positioning', () => {
  it('repositions AST, Notice Only, and Money Claim heroes away from broad-owner claims', () => {
    const source = readSource('src/components/landing/heroConfigs.tsx');

    expect(source).toContain("highlightTitle: 'England Agreement Routes'");
    expect(source).toContain("title: 'Need to Create the Right'");
    expect(source).toContain("title: 'Ready to Start a'");

    expect(source).not.toContain("highlightTitle: 'Eviction Notice UK?'");
    expect(source).not.toContain("title: 'Tenant Not Paying Rent?'");
  });

  it('updates Notice Only and Complete Pack value framing for the new pricing and service position', () => {
    const noticeSource = readSource('src/app/(marketing)/products/notice-only/page.tsx');
    const completePackSource = readSource('src/app/(marketing)/products/complete-pack/page.tsx');

    expect(noticeSource).toContain('avoid invalid notice mistakes');
    expect(noticeSource).toContain('route checks before you generate');
    expect(noticeSource).toContain('reduce delays caused by the wrong notice path');

    expect(completePackSource).toContain('notice-to-court continuity');
    expect(completePackSource).toContain('avoid missing forms or filing mistakes');
    expect(completePackSource).toContain('reduce delay risk');
    expect(completePackSource).toContain('notice, core court forms, and filing guidance together');
  });

  it('keeps money-claim product copy transactional rather than broad-owner led', () => {
    const source = readSource('src/app/(marketing)/products/money-claim/page.tsx');

    expect(source).toContain('start a landlord money claim pack');
    expect(source).toContain('what is included');
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
