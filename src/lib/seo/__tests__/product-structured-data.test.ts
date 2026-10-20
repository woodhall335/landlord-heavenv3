import { describe, expect, it } from 'vitest';

import { getDynamicReviewCount, REVIEW_RATING } from '@/lib/reviews/reviewStats';

import {
  buildAggregateRating,
  organizationSchema,
  productSchema,
  softwareApplicationSchema,
} from '../structured-data';

describe('product structured data', () => {
  it('includes required Product fields with the site-wide review pill rating', () => {
    const reviewCount = getDynamicReviewCount();
    const schema = productSchema({
      name: 'Supported Rent Increase Pack',
      description: 'Prepare Form 4A with market evidence and service record.',
      price: '39',
      url: 'https://landlordheaven.co.uk/products/section-13-standard',
    }) as any;

    expect(schema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Supported Rent Increase Pack',
      description: 'Prepare Form 4A with market evidence and service record.',
      url: 'https://landlordheaven.co.uk/products/section-13-standard',
      brand: {
        '@type': 'Brand',
        name: 'Landlord Heaven',
      },
      offers: expect.objectContaining({
        '@type': 'Offer',
        price: '39',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        url: 'https://landlordheaven.co.uk/products/section-13-standard',
      }),
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: REVIEW_RATING,
        reviewCount,
        ratingCount: reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    });
  });

  it('keeps global and tool ratings aligned with the review pill', () => {
    const aggregateRating = buildAggregateRating();

    expect(organizationSchema().aggregateRating).toEqual(aggregateRating);
    expect(softwareApplicationSchema().aggregateRating).toEqual(aggregateRating);
  });
});
