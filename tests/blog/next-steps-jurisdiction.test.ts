import { describe, expect, it } from 'vitest';
import {
  getEnglandOnlyCTAs,
  getNextStepsCTAs,
} from '@/lib/blog/next-steps-cta';

describe('getNextStepsCTAs jurisdiction-aware tenancy routing', () => {
  it.each([
    [
      'wales-occupation-contract-checklist',
      'Tenancy',
      ['Occupation Contract', 'Written Statement'],
      [
        '/wales-tenancy-agreement-template',
        '/renting-homes-wales-written-statement',
        '/products/ast',
      ],
    ],
    [
      'scotland-prt-checklist',
      'Tenancy',
      ['PRT', 'Landlord Registration'],
      [
        '/private-residential-tenancy-agreement-template',
        '/scotland-prt-model-agreement-guide',
        '/products/ast',
      ],
    ],
    [
      'northern-ireland-tenancy-agreement-rules',
      'Tenancy',
      ['Northern Ireland', 'Tenancy Agreement'],
      [
        '/northern-ireland-tenancy-agreement-template',
        '/tenancy-agreement-northern-ireland',
        '/products/ast',
      ],
    ],
  ])('routes %s to jurisdiction-safe tenancy next steps', (slug, category, tags, hrefs) => {
    const ctas = getNextStepsCTAs({ slug, category, tags });

    expect(ctas.map((cta) => cta.href)).toEqual(hrefs);
    expect(getEnglandOnlyCTAs(ctas)).toEqual([]);
  });
});

describe('getNextStepsCTAs avoids England-only arrears links on non-England content', () => {
  it.each([
    [
      'wales-rent-arrears-notice',
      'Eviction',
      ['Rent arrears', 'Wales'],
      ['/tenant-not-paying-rent', '/wales-eviction-notices', '/products/notice-only'],
    ],
    [
      'scotland-rent-arrears-steps',
      'Eviction',
      ['Rent arrears', 'Scotland'],
      ['/tenant-not-paying-rent', '/scotland-eviction-notices', '/products/notice-only'],
    ],
  ])('keeps %s free from England-only next-step links', (slug, category, tags, hrefs) => {
    const ctas = getNextStepsCTAs({ slug, category, tags });

    expect(ctas.map((cta) => cta.href)).toEqual(hrefs);
    expect(getEnglandOnlyCTAs(ctas)).toEqual([]);
  });
});
