import { describe, expect, it } from 'vitest';
import { metadata as hubMetadata } from '@/app/tenancy-agreement-template/page';
import { metadata as astMetadata } from '@/app/assured-shorthold-tenancy-agreement-template/page';
import { metadata as ukMetadata } from '@/app/tenancy-agreement-template-uk/page';
import { metadata as assuredPeriodicMetadata } from '@/app/assured-periodic-tenancy-agreement/page';

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

describe('tenancy funnel metadata', () => {
  it('positions the main hub as the England template owner', () => {
    expect(asText(hubMetadata.title)).toBe('Tenancy Agreement Template (England) - Example & Guide');
    expect(asText(hubMetadata.description)).toContain('England');
    expect(asText(hubMetadata.alternates?.canonical)).toContain('/tenancy-agreement-template');

    const keywords = Array.isArray(hubMetadata.keywords)
      ? hubMetadata.keywords.join(' ')
      : asText(hubMetadata.keywords);
    expect(keywords).toContain('tenancy agreement template');
    expect(keywords).toContain('rent agreement');
    expect(keywords).toContain('tenancy contract');
  });

  it('keeps the AST page as a legacy support page', () => {
    expect(asText(astMetadata.title)).toBe(
      'Assured Shorthold Tenancy Agreement Template | AST Legacy Guide'
    );
    expect(asText(astMetadata.description)).toContain('Legacy AST explainer');
    expect(asText(astMetadata.alternates?.canonical)).toContain(
      '/assured-shorthold-tenancy-agreement-template'
    );
  });

  it('keeps the assured periodic page as support-only metadata', () => {
    expect(asText(assuredPeriodicMetadata.title)).toBe(
      'Assured Periodic Tenancy Agreement | England Support Guide'
    );
    expect(asText(assuredPeriodicMetadata.description)).toContain('support page');
    expect(asText(assuredPeriodicMetadata.alternates?.canonical)).toContain(
      '/assured-periodic-tenancy-agreement'
    );
  });

  it('marks the UK router noindex,follow', () => {
    expect(asText(ukMetadata.title)).toBe('Tenancy Agreement Template UK | Choose Your Jurisdiction');
    expect((ukMetadata.robots as { index?: boolean; follow?: boolean } | undefined)?.index).toBe(
      false
    );
    expect((ukMetadata.robots as { index?: boolean; follow?: boolean } | undefined)?.follow).toBe(
      true
    );
  });
});

