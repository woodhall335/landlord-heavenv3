import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

import { productSamplePages } from '@/lib/marketing/product-sample-pages';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('sample and tenancy commercial positioning', () => {
  it('positions the samples index as a fact-built workflow, not a template library', () => {
    const source = readSource('src/app/samples/page.tsx');

    expect(source).toContain('Compared with a solicitor');
    expect(source).toContain('Compared with a wording-only download');
    expect(source).toContain('What Landlord Heaven validates before checkout');
    expect(source).toContain('Preview the pack before you pay');
    expect(source).toContain('solicitor-approved document workflow around the facts');
    expect(source).toContain('This is not a static form library');
  });

  it('keeps every generated sample detail page commercially tied to preview-before-pay workflow copy', () => {
    const source = readSource('src/app/samples/[slug]/page.tsx');

    expect(source).toContain('Solicitor-approved sample workflow');
    expect(source).toContain('Why this is not just another sample PDF');
    expect(source).toContain('Inspect the sample, then build the pack around your facts');
    expect(source).toContain('What Landlord Heaven validates before checkout');
    expect(source).toContain('solicitor-approved procedural workflow');
    expect(source).toContain('Build my {config.productName}');
  });

  it('makes tenancy sample CTAs sell validated setup packs', () => {
    const tenancySamples = productSamplePages.filter((page) =>
      [
        'england_standard_tenancy_agreement',
        'england_premium_tenancy_agreement',
        'england_student_tenancy_agreement',
        'england_hmo_shared_house_tenancy_agreement',
        'england_lodger_agreement',
      ].includes(page.packKey)
    );

    expect(tenancySamples).toHaveLength(5);
    for (const sample of tenancySamples) {
      expect(sample.ctaText).toContain('Build my validated');
      expect(sample.intro.toLowerCase()).toMatch(/validated|fact-built|built around/);
      expect(sample.productHref).toMatch(
        /^\/(standard-tenancy-agreement|premium-tenancy-agreement|student-tenancy-agreement|hmo-shared-house-tenancy-agreement|lodger-agreement)$/
      );
    }
  });

  it('keeps the shared England tenancy page shell focused on validation, templates, and safe solicitor wording', () => {
    const source = readSource('src/components/seo/EnglandTenancyPage.tsx');

    expect(source).toContain('Create a validated England tenancy setup pack around your property, occupiers, rent, deposit, and management facts.');
    expect(source).toContain('Compared with a wording-only download');
    expect(source).toContain('Compared with using a solicitor');
    expect(source).toContain('Validated before preview');
    expect(source).toContain('validate the key tenancy facts');
    expect(source).toContain('See the actual pack before you pay');
  });

  it('updates core England tenancy sales surfaces with validated pack CTAs', () => {
    const sources = [
      readSource('src/app/standard-tenancy-agreement/page.tsx'),
      readSource('src/app/premium-tenancy-agreement/page.tsx'),
      readSource('src/app/student-tenancy-agreement/page.tsx'),
      readSource('src/app/hmo-shared-house-tenancy-agreement/page.tsx'),
      readSource('src/app/lodger-agreement/page.tsx'),
      readSource('src/app/(marketing)/products/ast/page.tsx'),
      readSource('src/app/compare/tenancy-agreement-options-england/page.tsx'),
    ].join('\n');

    expect(sources).toContain('Build my validated Standard pack');
    expect(sources).toContain('Build my validated Premium pack');
    expect(sources).toContain('Build my validated Student pack');
    expect(sources).toContain('Build my validated HMO pack');
    expect(sources).toContain('Build my validated Lodger pack');
    expect(sources).toContain('wording-only');
    expect(sources).toContain('solicitor-approved document preparation');
  });
});
