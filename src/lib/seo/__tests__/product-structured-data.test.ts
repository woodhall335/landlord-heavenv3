import { describe, expect, it } from 'vitest';

import { productSchema } from '../structured-data';

describe('product structured data', () => {
  it('includes required Product fields without unverified aggregate ratings', () => {
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
    });
    expect(schema).not.toHaveProperty('aggregateRating');
  });
});
