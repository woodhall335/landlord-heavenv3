import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

describe('tenancy funnel sitemap and internal links', () => {
  it('includes the new tenancy funnel routes in the sitemap', () => {
    const content = readFileSync(join(process.cwd(), 'src/app/sitemap.ts'), 'utf8');

    [
      '/tenancy-agreement-template',
      '/tenancy-agreement-template-uk',
      '/tenancy-agreement-england-2026',
      '/assured-periodic-tenancy-agreement',
      '/hmo-tenancy-agreement-template',
    ].forEach((route) => {
      expect(content).toContain(`'${route}'`);
    });
  });

  it('defines the new tenancy funnel internal-link groups', () => {
    const content = readFileSync(join(process.cwd(), 'src/lib/seo/internal-links.ts'), 'utf8');

    expect(content).toContain('tenancyFunnelPages');
    expect(content).toContain('tenancyProductMoneyPageLinks');
    expect(content).toContain('astAgreementTemplateRelatedLinks');
    expect(content).toContain('tenancyAgreementTemplateUkRelatedLinks');
    expect(content).toContain('tenancyAgreementEngland2026RelatedLinks');
    expect(content).toContain('assuredPeriodicTenancyAgreementRelatedLinks');
    expect(content).toContain('hmoTenancyAgreementTemplateRelatedLinks');
  });
});
