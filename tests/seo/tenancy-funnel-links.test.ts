import sitemap from '@/app/sitemap';
import {
  landingPageLinks,
  productLinks,
  tenancyAgreementEnglandLinks,
  tenancyFunnelPages,
} from '@/lib/seo/internal-links';
import { describe, expect, it } from 'vitest';

const getSitemapPathnames = async (): Promise<string[]> => {
  const entries = await sitemap();
  return entries.map((entry) => new URL(entry.url).pathname);
};

describe('tenancy funnel sitemap and internal links', () => {
  it('keeps the live England tenancy funnel routes in the sitemap while excluding the noindex UK router', async () => {
    const paths = await getSitemapPathnames();

    expect(paths).toContain('/tenancy-agreement-template');
    expect(paths).toContain('/assured-shorthold-tenancy-agreement-template');
    expect(paths).toContain('/assured-periodic-tenancy-agreement');
    expect(paths).toContain('/products/ast');

    expect(paths).not.toContain('/tenancy-agreement-template-uk');
  });

  it('keeps the England hub first in funnel link groups and moves /products/ast downstream', () => {
    expect(landingPageLinks.tenancyTemplate.href).toBe('/tenancy-agreement-template');
    expect(tenancyFunnelPages.englandHub.href).toBe('/tenancy-agreement-template');
    expect(productLinks.tenancyAgreement.href).toBe('/products/ast');

    expect(tenancyAgreementEnglandLinks.map((link) => link.href)).toEqual([
      '/tenancy-agreement-template',
      '/standard-tenancy-agreement',
      '/premium-tenancy-agreement',
      '/student-tenancy-agreement',
      '/hmo-shared-house-tenancy-agreement',
      '/lodger-agreement',
      '/assured-shorthold-tenancy-agreement-template',
      '/assured-periodic-tenancy-agreement',
      '/products/ast',
      '/ask-heaven',
    ]);
  });
});
