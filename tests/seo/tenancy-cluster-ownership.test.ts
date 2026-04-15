import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { SEO_LANDING_ROUTES } from '@/lib/pricing/products';
import { getSeoPageTaxonomy } from '@/lib/seo/page-taxonomy';

const getSitemapPathnames = async (): Promise<string[]> => {
  const entries = await sitemap();
  return entries.map((entry) => new URL(entry.url).pathname);
};

describe('England tenancy cluster ownership', () => {
  it('routes the broad England tenancy chooser through /products/ast', () => {
    expect(SEO_LANDING_ROUTES.ast_standard).toBe('/products/ast');
    expect(SEO_LANDING_ROUTES.residential_tenancy_application).toBe('/products/ast');

    expect(getSeoPageTaxonomy('/products/ast')).toEqual(
      expect.objectContaining({
        canonicalTarget: '/products/ast',
        consolidationStatus: 'canonical',
      })
    );
  });

  it('keeps the exact tenancy routes indexable alongside the surviving support pages', async () => {
    const paths = await getSitemapPathnames();

    expect(paths).toEqual(
      expect.arrayContaining([
        '/products/ast',
        '/standard-tenancy-agreement',
        '/premium-tenancy-agreement',
        '/student-tenancy-agreement',
        '/hmo-shared-house-tenancy-agreement',
        '/lodger-agreement',
        '/tenancy-agreement-template',
        '/assured-shorthold-tenancy-agreement-template',
        '/assured-periodic-tenancy-agreement',
      ])
    );

    expect(paths).not.toContain('/tenancy-agreement');
    expect(paths).not.toContain('/tenancy-agreement-template-free');
    expect(paths).not.toContain('/ast-agreement-template');
    expect(paths).not.toContain('/ast-template-england');
    expect(paths).not.toContain('/ast-tenancy-agreement-template');
    expect(paths).not.toContain('/tenancy-agreement-template-uk');
  });

  it('keeps the retired tenancy aliases as direct redirects to the surviving destinations', () => {
    const expectations: Array<[string, string]> = [
      ['src/app/tenancy-agreement/page.tsx', "permanentRedirect('/tenancy-agreement-template')"],
      [
        'src/app/tenancy-agreement-template-free/page.tsx',
        "permanentRedirect('/tenancy-agreement-template')",
      ],
      [
        'src/app/ast-agreement-template/page.tsx',
        "permanentRedirect('/assured-shorthold-tenancy-agreement-template')",
      ],
      [
        'src/app/ast-template-england/page.tsx',
        "permanentRedirect('/assured-shorthold-tenancy-agreement-template')",
      ],
      [
        'src/app/ast-tenancy-agreement-template/page.tsx',
        "permanentRedirect('/assured-shorthold-tenancy-agreement-template')",
      ],
    ];

    expectations.forEach(([relativePath, expectedRedirect]) => {
      const content = readFileSync(join(process.cwd(), relativePath), 'utf8');
      expect(content).toContain(expectedRedirect);
    });
  });
});
