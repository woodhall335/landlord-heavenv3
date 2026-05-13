import { describe, expect, it } from 'vitest';

import {
  STRUCTURED_PRODUCT_REVIEW_COUNT,
  productSchema,
} from '../structured-data';
import { REVIEW_RATING } from '@/lib/reviews/reviewStats';

describe('product structured data', () => {
  it('includes required Product fields with pinned aggregate rating', () => {
    const schema = productSchema({
      name: 'Standard Section 13 Rent Increase Pack',
      description: 'Prepare Form 4A with market evidence and service record.',
      price: '39',
      url: 'https://landlordheaven.co.uk/products/section-13-standard',
    }) as any;

    expect(schema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Standard Section 13 Rent Increase Pack',
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
        reviewCount: STRUCTURED_PRODUCT_REVIEW_COUNT.toString(),
        ratingCount: STRUCTURED_PRODUCT_REVIEW_COUNT.toString(),
      },
    });
  });
});
