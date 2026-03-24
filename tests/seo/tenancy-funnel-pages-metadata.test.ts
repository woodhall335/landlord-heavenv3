import { describe, expect, it } from 'vitest';
import { metadata as astAgreementTemplateMetadata } from '@/app/ast-agreement-template/page';
import { metadata as tenancyAgreementTemplateUkMetadata } from '@/app/tenancy-agreement-template-uk/page';
import { metadata as tenancyAgreementEngland2026Metadata } from '@/app/tenancy-agreement-england-2026/page';
import { metadata as assuredPeriodicMetadata } from '@/app/assured-periodic-tenancy-agreement/page';
import { metadata as hmoMetadata } from '@/app/hmo-tenancy-agreement-template/page';

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

const pageMetadata = [
  {
    name: '/ast-agreement-template',
    metadata: astAgreementTemplateMetadata,
    expectedTitle: 'AST Agreement Template UK | England Updated for 1 May 2026',
    keyword: 'ast agreement template',
  },
  {
    name: '/tenancy-agreement-template-uk',
    metadata: tenancyAgreementTemplateUkMetadata,
    expectedTitle: 'Tenancy Agreement Template UK | England Updated for 1 May 2026',
    keyword: 'tenancy agreement template uk',
  },
  {
    name: '/tenancy-agreement-england-2026',
    metadata: tenancyAgreementEngland2026Metadata,
    expectedTitle: 'Do I Need a New Tenancy Agreement After 1 May 2026? | England Guide',
    keyword: 'tenancy agreement england 2026',
  },
  {
    name: '/assured-periodic-tenancy-agreement',
    metadata: assuredPeriodicMetadata,
    expectedTitle: 'Assured Periodic Tenancy Agreement | England Explainer',
    keyword: 'assured periodic tenancy agreement',
  },
  {
    name: '/hmo-tenancy-agreement-template',
    metadata: hmoMetadata,
    expectedTitle: 'HMO Tenancy Agreement Template | Premium England Route',
    keyword: 'hmo tenancy agreement template',
  },
];

describe('tenancy funnel metadata', () => {
  it.each(pageMetadata)('%s includes England-first metadata', ({ metadata, expectedTitle, keyword }) => {
    expect(asText(metadata.title)).toBe(expectedTitle);
    expect(asText(metadata.description)).toContain('England');

    const keywords = metadata.keywords ?? [];
    const keywordText = Array.isArray(keywords) ? keywords.join(' ') : asText(keywords);
    expect(keywordText).toContain(keyword);
  });

  it('keeps 1 May 2026 visible on the relevant pages', () => {
    expect(asText(astAgreementTemplateMetadata.description)).toContain('1 May 2026');
    expect(asText(tenancyAgreementTemplateUkMetadata.description)).toContain('1 May 2026');
    expect(asText(tenancyAgreementEngland2026Metadata.title)).toContain('1 May 2026');
    expect(asText(assuredPeriodicMetadata.description)).toContain('1 May 2026');
  });
});
