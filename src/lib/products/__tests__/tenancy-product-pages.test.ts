import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('tenancy product pages', () => {
  it('/products/ast acts as the England comparison owner page', () => {
    const source = readSource('src/app/(marketing)/products/ast/page.tsx');

    expect(source).toContain('Start here if you are not sure which England agreement to use');
    expect(source).toContain('Compare all five England agreement types in one place');
    expect(source).toContain('Standard, Premium, Student, HMO / Shared House');
    expect(source).toContain('pricingItemListSchema');
  });

  it('England support and bridge pages route landlords into the right specialist products', () => {
    const englandGuide = readSource('src/app/tenancy-agreements/england/page.tsx');
    const jointEngland = readSource('src/app/joint-tenancy-agreement-england/page.tsx');
    const jointTemplate = readSource('src/app/joint-tenancy-agreement-template/page.tsx');
    const landlordDocs = readSource('src/app/landlord-documents-england/page.tsx');

    expect(englandGuide).toContain('View the England agreement example');
    expect(englandGuide).toContain('Compare England routes');
    expect(englandGuide).toContain('Student, HMO / Shared House, and Lodger');
    expect(jointEngland).toContain('Dedicated Student and HMO / Shared House routes for specialist shared lets');
    expect(jointTemplate).toContain('Dedicated Student and HMO / Shared House routes for specialist shared lets');
    expect(landlordDocs).toContain('Student, HMO / Shared House, and Lodger now have their own England routes.');
  });

  it('legacy England tenancy pages now hand landlords into product-owner pages instead of wizard-first support copy', () => {
    const sixMonthSource = readSource('src/app/6-month-tenancy-agreement-template/page.tsx');
    const fixedTermSource = readSource('src/app/fixed-term-tenancy-agreement-template/page.tsx');
    const fixedToPeriodicSource = readSource('src/app/fixed-term-periodic-tenancy-england/page.tsx');
    const rollingSource = readSource('src/app/rolling-tenancy-agreement/page.tsx');
    const periodicSource = readSource('src/app/periodic-tenancy-agreement/page.tsx');

    for (const source of [
      sixMonthSource,
      fixedTermSource,
      fixedToPeriodicSource,
      rollingSource,
      periodicSource,
    ]) {
      expect(source).not.toContain('/wizard?product=ast_standard');
      expect(source).not.toContain('/wizard?product=ast_premium');
    }

    expect(periodicSource).toContain("href: standardAgreementHref");
    expect(periodicSource).toContain("href: premiumAgreementHref");
  });

  it('shared England SEO tenancy page component exposes keyword, pack, and route-comparison sections', () => {
    const source = readSource('src/components/seo/EnglandTenancyPage.tsx');

    expect(source).toContain('Common landlord searches this route covers');
    expect(source).toContain('This route is usually right if');
    expect(source).toContain('What you get');
    expect(source).toContain('Compare England agreement routes');
  });

  it('legacy tier-picker copy signposts specialist England products clearly', () => {
    const source = readSource('src/components/wizard/flows/TenancySectionFlow.tsx');

    expect(source).toContain(
      'Premium England assured periodic tenancy agreement with fuller ordinary-residential drafting, guarantor support, and enhanced operational terms for the current framework.'
    );
    expect(source).toContain(
      'Standard covers straightforward ordinary residential lets. Premium adds fuller drafting, guarantor support, rent review, and tighter controls. Student, HMO / Shared House, and Lodger now have dedicated England products.'
    );
  });

  it('Standard and Premium pages lead with searched product terms while keeping current England wording', () => {
    const standardSource = readSource('src/app/standard-tenancy-agreement/page.tsx');
    const premiumSource = readSource('src/app/premium-tenancy-agreement/page.tsx');

    expect(standardSource).toContain("title: 'Standard Tenancy Agreement England");
    expect(standardSource).toContain("name: 'Standard Tenancy Agreement'");
    expect(standardSource).toContain('assured periodic');
    expect(standardSource).toContain('Renters Rights Act tenancy agreement');
    expect(standardSource).toContain('new tenancy agreement generator');
    expect(standardSource).toContain('legacyNotice=');

    expect(premiumSource).toContain("title: 'Premium Tenancy Agreement England");
    expect(premiumSource).toContain("name: 'Premium Tenancy Agreement'");
    expect(premiumSource).toContain('assured periodic');
    expect(premiumSource).toContain('Renters Rights Act tenancy agreement');
    expect(premiumSource).toContain('new tenancy agreement generator');
    expect(premiumSource).toContain('england tenancy agreement management schedule');
    expect(premiumSource).toContain('stronger supporting pack with a management schedule and handover paperwork');
  });
});
