import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { rentersRightsInformationSheet2026RelatedLinks } from '@/lib/seo/internal-links';

describe("renters' rights information sheet link wiring", () => {
  it('exposes the required related links for the new page', () => {
    const hrefs = rentersRightsInformationSheet2026RelatedLinks.map((link) => link.href);

    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/products/ast',
        '/tenancy-agreement-england-2026',
        '/assured-periodic-tenancy-agreement',
        '/landlord-documents-england',
      ])
    );
  });

  it('pins the page in the sitemap', () => {
    const sitemapSource = fs.readFileSync(
      path.join(process.cwd(), 'src/app/sitemap.ts'),
      'utf8'
    );

    expect(sitemapSource).toContain("/renters-rights-act-information-sheet-2026");
    expect(sitemapSource).toContain('priority: 0.82');
  });
});
