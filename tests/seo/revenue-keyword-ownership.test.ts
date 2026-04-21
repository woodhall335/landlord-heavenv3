import { describe, expect, it } from 'vitest';
import { metadata as astMetadata } from '@/app/(marketing)/products/ast/page';
import { metadata as completePackMetadata } from '@/app/(marketing)/products/complete-pack/page';
import { metadata as moneyClaimMetadata } from '@/app/(marketing)/products/money-claim/page';
import { metadata as noticeOnlyMetadata } from '@/app/(marketing)/products/notice-only/page';
import { metadata as section13DefenceMetadata } from '@/app/(marketing)/products/section-13-defence/page';
import { metadata as section13StandardMetadata } from '@/app/(marketing)/products/section-13-standard/page';
import { metadata as tenancyTemplateMetadata } from '@/app/tenancy-agreement-template/page';
import { metadata as premiumTenancyMetadata } from '@/app/premium-tenancy-agreement/page';
import { metadata as standardTenancyMetadata } from '@/app/standard-tenancy-agreement/page';
import { getPublicProductDescriptor } from '@/lib/public-products';

const asKeywords = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((keyword) => String(keyword).toLowerCase()) : [];

describe('revenue keyword ownership', () => {
  it('keeps the top eviction and debt product terms on the public owner pages', () => {
    expect(asKeywords(noticeOnlyMetadata.keywords)).toEqual(
      expect.arrayContaining([
        'section 8 notice',
        'section 8 notice england',
        'eviction notice generator',
        'evict a tenant legally',
        'form 3a',
      ])
    );

    expect(asKeywords(completePackMetadata.keywords)).toEqual(
      expect.arrayContaining([
        'complete eviction pack',
        'eviction process england',
      ])
    );

    expect(asKeywords(moneyClaimMetadata.keywords)).toEqual(
      expect.arrayContaining(['money claim unpaid rent'])
    );
  });

  it('keeps section 13 commercial intent on the rent increase owner pages', () => {
    expect(asKeywords(section13StandardMetadata.keywords)).toEqual(
      expect.arrayContaining(['section 13 notice rent increase', 'form 4a rent increase'])
    );

    expect(asKeywords(section13DefenceMetadata.keywords)).toEqual(
      expect.arrayContaining(['section 13 tribunal defence'])
    );
  });

  it('keeps tenancy template and periodic wording on the tenancy owner journey', () => {
    expect(asKeywords(astMetadata.keywords)).toEqual(
      expect.arrayContaining([
        'tenancy agreement template england',
        'periodic tenancy agreement england',
        'assured periodic tenancy agreement england',
      ])
    );

    expect(asKeywords(tenancyTemplateMetadata.keywords)).toEqual(
      expect.arrayContaining(['tenancy agreement template england', 'periodic tenancy agreement england'])
    );

    expect(asKeywords(standardTenancyMetadata.keywords)).toEqual(
      expect.arrayContaining(['periodic tenancy agreement england'])
    );

    expect(asKeywords(premiumTenancyMetadata.keywords)).toEqual(
      expect.arrayContaining(['periodic tenancy agreement england', 'assured periodic tenancy agreement england'])
    );
  });

  it('surfaces periodic support links inside the tenancy public descriptor layer', () => {
    const hubDescriptor = getPublicProductDescriptor('ast');
    const standardDescriptor = getPublicProductDescriptor('england_standard_tenancy_agreement');
    const premiumDescriptor = getPublicProductDescriptor('england_premium_tenancy_agreement');

    expect(hubDescriptor?.defaultGuideLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: '/periodic-tenancy-agreement' }),
      ])
    );

    expect(standardDescriptor?.defaultGuideLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: '/periodic-tenancy-agreement' }),
      ])
    );

    expect(premiumDescriptor?.defaultGuideLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: '/assured-periodic-tenancy-agreement' }),
      ])
    );
  });
});
