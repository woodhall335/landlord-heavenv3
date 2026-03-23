import { describe, expect, it } from 'vitest';
import { breadcrumbSchema } from '@/lib/seo/structured-data';

describe('breadcrumbSchema', () => {
  it('converts relative breadcrumb URLs into absolute site URLs', () => {
    const schema = breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Tools', url: '/tools' },
      { name: 'Form 6A Section 21', url: '/form-6a-section-21' },
    ]);

    expect(schema.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://landlordheaven.co.uk',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: 'https://landlordheaven.co.uk/tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Form 6A Section 21',
        item: 'https://landlordheaven.co.uk/form-6a-section-21',
      },
    ]);
  });

  it('leaves absolute breadcrumb URLs unchanged', () => {
    const schema = breadcrumbSchema([
      { name: 'Home', url: 'https://landlordheaven.co.uk' },
      { name: 'Northern Ireland', url: 'https://landlordheaven.co.uk/northern-ireland-tenancy-agreement-template' },
    ]);

    expect(schema.itemListElement[0].item).toBe('https://landlordheaven.co.uk');
    expect(schema.itemListElement[1].item).toBe('https://landlordheaven.co.uk/northern-ireland-tenancy-agreement-template');
  });
});
