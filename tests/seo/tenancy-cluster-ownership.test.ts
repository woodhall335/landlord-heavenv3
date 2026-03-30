import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { SEO_LANDING_ROUTES } from '@/lib/pricing/products';
import {
  getSeoPageTaxonomy,
  getTopInternalLinkRecipients,
} from '@/lib/seo/page-taxonomy';

const getSitemapPathnames = async (): Promise<string[]> => {
  const entries = await sitemap();
  return entries.map((entry) => new URL(entry.url).pathname);
};

describe('England tenancy cluster ownership', () => {
  it('points standard-tenancy canonical ownership at the main hub', () => {
    expect(SEO_LANDING_ROUTES.ast_standard).toBe('/tenancy-agreement-template');
    expect(SEO_LANDING_ROUTES.residential_tenancy_application).toBe(
      '/tenancy-agreement-template'
    );

    expect(getSeoPageTaxonomy('/tenancy-agreement-template')?.consolidationStatus).toBe(
      'canonical'
    );
    expect(getSeoPageTaxonomy('/tenancy-agreement-template')?.supportingPage).toBe(
      '/assured-periodic-tenancy-agreement'
    );

    expect(getSeoPageTaxonomy('/tenancy-agreement')?.canonicalTarget).toBe(
      '/tenancy-agreement-template'
    );
    expect(getSeoPageTaxonomy('/tenancy-agreement-template-free')?.canonicalTarget).toBe(
      '/tenancy-agreement-template'
    );
    expect(
      getSeoPageTaxonomy('/assured-shorthold-tenancy-agreement-template')?.supportingPage
    ).toBe('/tenancy-agreement-template');
  });

  it('keeps the hub and support pages in the sitemap while excluding aliases and the UK router', async () => {
    const paths = await getSitemapPathnames();

    expect(paths).toContain('/tenancy-agreement-template');
    expect(paths).toContain('/assured-shorthold-tenancy-agreement-template');
    expect(paths).toContain('/assured-periodic-tenancy-agreement');
    expect(paths).toContain('/products/ast');

    expect(paths).not.toContain('/tenancy-agreement');
    expect(paths).not.toContain('/tenancy-agreement-template-free');
    expect(paths).not.toContain('/ast-agreement-template');
    expect(paths).not.toContain('/ast-template-england');
    expect(paths).not.toContain('/ast-tenancy-agreement-template');
    expect(paths).not.toContain('/tenancy-agreement-template-uk');
  });

  it('keeps the hub ahead of the route-selection and support pages in taxonomy link counts', () => {
    const recipients = getTopInternalLinkRecipients(250);
    const getCount = (pathname: string) =>
      recipients.find((entry) => entry.pathname === pathname)?.inboundCount ?? 0;

    const hubCount = getCount('/tenancy-agreement-template');

    expect(hubCount).toBeGreaterThan(0);
    expect(hubCount).toBeGreaterThan(getCount('/products/ast'));
    expect(hubCount).toBeGreaterThan(getCount('/assured-shorthold-tenancy-agreement-template'));
    expect(hubCount).toBeGreaterThan(getCount('/assured-periodic-tenancy-agreement'));
  });

  it('keeps the retired alias pages as direct redirects to the consolidated destinations', () => {
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
