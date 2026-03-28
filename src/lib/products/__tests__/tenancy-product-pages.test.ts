import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('tenancy product pages', () => {
  it('/products/ast uses the shared tenancy pack section and pack-first copy', () => {
    const source = readSource('src/app/(marketing)/products/ast/page.tsx');

    expect(source).toContain('More than a tenancy agreement. A pack built to protect your position.');
    expect(source).toContain('Preview before payment');
    expect(source).toContain('Supporting documents included');
    expect(source).toContain('A practical pack: the agreement');
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

    expect(source).toContain('Common England searches this page answers');
    expect(source).toContain('Usually the right route if');
    expect(source).toContain('What is included in this pack');
    expect(source).toContain('Compare England agreement routes');
  });

  it('England hub and Premium page surface structured product SEO and stronger Premium-specific positioning', () => {
    const hubSource = readSource('src/app/tenancy-agreement/page.tsx');
    const premiumSource = readSource('src/app/premium-tenancy-agreement/page.tsx');

    expect(hubSource).toContain('pricingItemListSchema');
    expect(hubSource).toContain('Ordinary residential Premium route with fuller management, access, handover, and operational drafting.');
    expect(premiumSource).toContain('productSchema');
    expect(premiumSource).toContain('england tenancy agreement management schedule');
    expect(premiumSource).toContain('stronger supporting pack with a management schedule, handover records, utilities notes, pet-consent record, and variation paperwork');
  });
});
