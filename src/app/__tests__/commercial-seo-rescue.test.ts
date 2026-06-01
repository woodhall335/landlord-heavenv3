import { readFileSync } from 'node:fs';

import { metadata as howToRentMetadata } from '@/app/how-to-rent-guide/page';
import { metadata as courtClaimMetadata } from '@/app/n5-n119-possession-claim/page';
import { metadata as section8TemplateMetadata } from '@/app/section-8-notice-template/page';
import { form4aGuidePage } from '@/app/rent-increase/config/form-4a-guide';
import { CURRENT_ENGLAND_FRAMEWORK_PAGES } from '@/lib/seo/england-current-framework-pages';

describe('commercial SEO rescue pages', () => {
  it('positions Form 3A and Section 8 template searches around serving the notice', () => {
    const form3 = CURRENT_ENGLAND_FRAMEWORK_PAGES['form-3-section-8'];

    expect(form3.title).toContain('Serve Form 3A');
    expect(form3.description).toContain('right grounds, dates, service proof');
    expect(section8TemplateMetadata.title).toContain('Without Date or Service Mistakes');

    const currentFrameworkRenderer = readFileSync('src/components/seo/CurrentFrameworkGuidePage.tsx', 'utf8');
    const section8TemplatePage = readFileSync('src/app/section-8-notice-template/page.tsx', 'utf8');

    expect(currentFrameworkRenderer).toContain('NoticeOnlyBridge');
    expect(section8TemplatePage).toContain('NoticeOnlyBridge');
  });

  it('keeps the court-claim page focused on Complete Pack after notice', () => {
    expect(courtClaimMetadata.title).toContain('N5 and N119 Court Papers After Notice');
    expect(courtClaimMetadata.description).toContain('Complete Pack next steps');
  });

  it('points How to Rent setup intent at the tenancy product first', () => {
    expect(howToRentMetadata.title).toContain('Compliance Check Before Notice');

    const howToRentPage = readFileSync('src/app/how-to-rent-guide/page.tsx', 'utf8');
    expect(howToRentPage).toContain("const tenancyProductHref = '/products/ast'");
    expect(howToRentPage).toContain('Create the right tenancy agreement');
  });

  it('positions Form 4A around evidence and tenant challenge risk', () => {
    expect(form4aGuidePage.metaTitle).toContain('Serve Notice With Evidence');
    expect(form4aGuidePage.metaDescription).toContain('market evidence');
    expect(form4aGuidePage.heroSubtitle).toContain('before the tenant receives it');
  });
});
