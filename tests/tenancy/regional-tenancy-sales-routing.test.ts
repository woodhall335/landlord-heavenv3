import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

function findPageSources(directory: string): string[] {
  return readdirSync(join(process.cwd(), directory), { withFileTypes: true }).flatMap((entry) => {
    const relativePath = `${directory}/${entry.name}`;
    return entry.isDirectory()
      ? findPageSources(relativePath)
      : entry.name === 'page.tsx'
        ? [relativePath]
        : [];
  });
}

const regionalSalesPages = [
  'src/app/tenancy-agreements/wales/page.tsx',
  'src/app/tenancy-agreements/scotland/page.tsx',
  'src/app/tenancy-agreements/northern-ireland/page.tsx',
  'src/app/standard-occupation-contract-wales/page.tsx',
  'src/app/occupation-contract-template-wales/page.tsx',
  'src/app/prt-tenancy-agreement-template-scotland/page.tsx',
  'src/app/private-residential-tenancy-agreement-scotland/page.tsx',
  'src/app/prt-template-scotland/page.tsx',
  'src/app/tenancy-agreement-northern-ireland/page.tsx',
  'src/app/tenancy-agreement-template-northern-ireland/page.tsx',
  'src/app/ni-private-tenancy-agreement/page.tsx',
];

describe('regional tenancy sales routing', () => {
  it('uses the direct tenancy flow instead of the legacy wizard entry on regional sales pages', () => {
    for (const page of regionalSalesPages) {
      const source = readSource(page);
      expect(source, page).not.toContain('/wizard?product=ast_standard');
    }

    const registry = readSource('src/lib/tenancy/agreement-registry.ts');
    expect(registry).toContain(
      '/wizard/flow?type=tenancy_agreement&product=ast_standard&jurisdiction=wales&contract_type=fixed'
    );
    expect(registry).toContain(
      '/wizard/flow?type=tenancy_agreement&product=ast_standard&jurisdiction=scotland'
    );
    expect(registry).toContain(
      '/wizard/flow?type=tenancy_agreement&product=ast_standard&jurisdiction=northern-ireland'
    );

    const publicTenancyPages = readSource(
      'src/app/assured-shorthold-tenancy-agreement/page.tsx'
    );
    expect(publicTenancyPages).not.toContain('/wizard?product=ast_standard');
    expect(publicTenancyPages).not.toContain('/wizard?product=ast_premium');
  });

  it('does not advertise unreleased regional Premium tenancy products', () => {
    for (const page of [
      'src/app/standard-occupation-contract-wales/page.tsx',
      'src/app/occupation-contract-template-wales/page.tsx',
      'src/app/prt-tenancy-agreement-template-scotland/page.tsx',
      'src/app/prt-template-scotland/page.tsx',
      'src/app/tenancy-agreement-northern-ireland/page.tsx',
    ]) {
      const source = readSource(page);
      expect(source, page).not.toMatch(/Premium (?:Contract|Template|PRT|Agreement)/);
    }
  });

  it('keeps every public regional tenancy page away from England and legacy sales routes', () => {
    const publicTenancyPages = findPageSources('src/app').filter((page) =>
      /tenan|occupation-contract|prt/i.test(page)
    );
    const regionalPages = publicTenancyPages.filter((page) =>
      /wales|scotland|northern-ireland|occupation-contract|prt/i.test(page)
    );

    for (const page of publicTenancyPages) {
      const source = readSource(page);
      expect(source, page).not.toMatch(/\/wizard\?product=ast_(?:standard|premium)/);
    }

    for (const page of regionalPages) {
      const source = readSource(page);
      expect(source, page).not.toContain('/products/ast');
      expect(source, page).not.toContain('ast_premium');
      expect(source, page).not.toMatch(/\bPremium (?:Contract|Template|PRT|Agreement|Pack)\b/i);
    }
  });

  it('scopes the shared standard page clearly before its England-only comparison', () => {
    const source = readSource('src/app/standard-tenancy-agreement/page.tsx');

    expect(source).toContain('One UK selector, four different legal frameworks');
    expect(source).toContain('The detailed comparison below is for England.');
    expect(source).toContain('Regional Premium products are not');
    expect(source).toContain('England standard agreement details');
  });

  it('keeps shared discovery, pricing and redirects aligned with the released range', () => {
    const pricing = readSource('src/lib/pricing.ts');
    const nav = readSource('src/components/ui/NavBar.tsx');
    const footer = readSource('src/components/layout/Footer.tsx');
    const genericRoute = readSource('src/app/tenancy-agreement/page.tsx');
    const wizardContent = readSource('src/lib/seo/wizard-landing-content.ts');

    expect(pricing).toContain("tenancy_agreement_premium: ['england']");
    expect(nav).toContain('Choose by Property Jurisdiction');
    expect(nav).toContain('Wales Standard Occupation Contracts');
    expect(nav).toContain('Scotland Standard PRT');
    expect(nav).toContain('Northern Ireland Standard Agreement');
    expect(footer).toContain('Wales Standard Occupation Contracts');
    expect(footer).toContain('Scotland Standard PRT');
    expect(footer).toContain('Northern Ireland Standard Agreement');
    expect(genericRoute).toContain(
      "permanentRedirect('/standard-tenancy-agreement#choose-jurisdiction')"
    );
    expect(wizardContent).toContain("jurisdictions: ['England']");
    expect(wizardContent).not.toContain('In other jurisdictions, Premium');
  });
});
