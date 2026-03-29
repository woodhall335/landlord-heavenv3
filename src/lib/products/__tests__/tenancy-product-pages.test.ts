import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('tenancy product pages', () => {
  it('/products/ast acts as the five-route England tenancy hub', () => {
    const source = readSource('src/app/(marketing)/products/ast/page.tsx');

    expect(source).toContain('Start here if you are not sure which England agreement to use');
    expect(source).toContain('Compare all five England agreement types in one place');
    expect(source).toContain('Standard, Premium, Student, HMO / Shared House, and Room Let / Lodger');
    expect(source).toContain('pricingItemListSchema');
  });

  it.each([
    'src/app/tenancy-agreements/england/page.tsx',
    'src/app/tenancy-agreements/wales/page.tsx',
    'src/app/tenancy-agreements/scotland/page.tsx',
    'src/app/tenancy-agreements/northern-ireland/page.tsx',
  ])('%s includes the shared tenancy pack section', (relativePath) => {
    const source = readSource(relativePath);

    expect(source).toContain('<TenancyPackSection');
    expect(source).toContain('lockJurisdiction');
  });

  it('England SEO and bridge pages no longer market Premium as the HMO/student/lodger shortcut', () => {
    const englandHub = readSource('src/app/tenancy-agreements/england/page.tsx');
    const jointEngland = readSource('src/app/joint-tenancy-agreement-england/page.tsx');
    const jointTemplate = readSource('src/app/joint-tenancy-agreement-template/page.tsx');
    const landlordDocs = readSource('src/app/landlord-documents-england/page.tsx');

    expect(englandHub).not.toContain(
      'Premium is usually the better fit where the tenancy is more complex, such as HMOs, student lets, multiple sharers, guarantor-backed arrangements, or situations where broader drafting and more operational detail matter from the outset.'
    );
    expect(jointEngland).not.toContain('Premium route available for HMOs, guarantors, and more complex shared lets');
    expect(jointTemplate).not.toContain('Premium route available for more complex sharer, HMO, or student lets');
    expect(landlordDocs).not.toContain('Use the premium route for HMOs, sharers, student lets, and more complex households.');

    expect(englandHub).toContain('Student, HMO / Shared House, or Lodger');
    expect(jointEngland).toContain('Dedicated Student and HMO / Shared House routes for specialist shared lets');
    expect(jointTemplate).toContain('Standard, Premium, Student, and HMO / Shared House routes');
    expect(landlordDocs).toContain('Student, HMO / Shared House, and Lodger now have their own England routes.');
  });

  it('legacy England tier-picker copy signposts dedicated specialist products', () => {
    const source = readSource('src/components/wizard/flows/TenancySectionFlow.tsx');

    expect(source).not.toContain(
      'Premium England assured periodic tenancy agreement with HMO, student, guarantor, and enhanced terms support, updated for the current framework.'
    );

    expect(source).toContain(
      'Premium England assured periodic tenancy agreement with fuller ordinary-residential drafting, guarantor support, and enhanced operational terms for the current framework.'
    );
    expect(source).toContain(
      'Standard covers straightforward ordinary residential lets. Premium adds fuller drafting, guarantor support, rent review, and tighter controls. Student, HMO / Shared House, and Lodger now have dedicated England products.'
    );
    expect(source).toContain(
      'Student, HMO / Shared House, and Lodger now have dedicated England products.'
    );
  });

  it('shared England SEO tenancy page component exposes richer keyword, pack, and comparison sections', () => {
    const source = readSource('src/components/seo/EnglandTenancyPage.tsx');

    expect(source).toContain('People often land here looking for');
    expect(source).toContain('This route is usually right if');
    expect(source).toContain('What you get');
    expect(source).toContain('Compare England agreement routes');
  });

  it('England hub redirects to /products/ast and Premium page surfaces stronger positioning', () => {
    const hubSource = readSource('src/app/tenancy-agreement/page.tsx');
    const astHubSource = readSource('src/app/(marketing)/products/ast/page.tsx');
    const premiumSource = readSource('src/app/premium-tenancy-agreement/page.tsx');

    expect(hubSource).toContain("permanentRedirect('/products/ast')");
    expect(astHubSource).toContain('For a normal residential let where you want fuller wording around access, repairs, keys, handover, and day-to-day management.');
    expect(premiumSource).toContain('productSchema');
    expect(premiumSource).toContain('england tenancy agreement management schedule');
    expect(premiumSource).toContain('stronger supporting pack with a management schedule and handover paperwork');
  });

  it('Standard and Premium England pages use assured periodic naming in their page-facing labels', () => {
    const standardSource = readSource('src/app/standard-tenancy-agreement/page.tsx');
    const premiumSource = readSource('src/app/premium-tenancy-agreement/page.tsx');
    const astHubSource = readSource('src/app/(marketing)/products/ast/page.tsx');

    expect(standardSource).toContain('Assured Periodic Tenancy Agreement England');
    expect(standardSource).toContain("name: 'Assured Periodic Tenancy Agreement'");
    expect(premiumSource).toContain('Premium Assured Periodic Tenancy Agreement England');
    expect(premiumSource).toContain("name: 'Premium Assured Periodic Tenancy Agreement'");
    expect(astHubSource).toContain('Assured Periodic Tenancy Agreement');
    expect(astHubSource).toContain('Premium Assured Periodic Tenancy Agreement');
  });

  it('Standard and Premium England pages add new-tenancy search-intent copy without dropping assured periodic primacy', () => {
    const standardSource = readSource('src/app/standard-tenancy-agreement/page.tsx');
    const premiumSource = readSource('src/app/premium-tenancy-agreement/page.tsx');

    expect(standardSource).toContain('Assured Periodic Tenancy Agreement England');
    expect(standardSource).toContain('Renters Rights Act tenancy agreement');
    expect(standardSource).toContain('new tenancy agreement generator');
    expect(standardSource).toContain('legacyNotice=');

    expect(premiumSource).toContain('Premium Assured Periodic Tenancy Agreement England');
    expect(premiumSource).toContain('Renters Rights Act tenancy agreement');
    expect(premiumSource).toContain('new tenancy agreement generator');
    expect(premiumSource).toContain('legacyNotice=');
  });
});
