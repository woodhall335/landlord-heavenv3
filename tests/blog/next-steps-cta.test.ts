import { describe, expect, it } from 'vitest';
import { getNextStepsCTAs } from '@/lib/blog/next-steps-cta';

describe('getNextStepsCTAs money-claim overrides', () => {
  it.each([
    [
      'england-money-claim-online',
      'Money Claims',
      ['MCOL', 'Rent Recovery'],
      [
        { href: '/money-claim-online-mcol', label: 'Money Claim Online MCOL Guide' },
        { href: '/money-claim-unpaid-rent', label: 'Claim Unpaid Rent' },
        { href: '/products/money-claim', label: 'Money Claim Pack' },
      ],
    ],
    [
      'england-particulars-of-claim',
      'Money Claims',
      ['Particulars of Claim', 'Rent Arrears'],
      [
        { href: '/money-claim-n1-claim-form', label: 'N1 Claim Form Guide' },
        { href: '/money-claim-schedule-of-debt', label: 'Schedule of Debt Guide' },
        { href: '/products/money-claim', label: 'Money Claim Pack' },
      ],
    ],
    [
      'uk-money-claims-online-guide',
      'Legal Compliance',
      ['Money Claims Online', 'Unpaid Rent'],
      [
        { href: '/money-claim-online-mcol', label: 'Money Claim Online MCOL Guide' },
        { href: '/money-claim-small-claims-landlord', label: 'Small Claims Court for Landlords' },
        { href: '/products/money-claim', label: 'Money Claim Pack' },
      ],
    ],
  ])('returns curated debt-recovery routes for %s', (slug, category, tags, expected) => {
    const ctas = getNextStepsCTAs({ slug, category, tags });

    expect(ctas.map(({ href, label }) => ({ href, label }))).toEqual(expected);
    expect(ctas[ctas.length - 1]?.href).toBe('/products/money-claim');
    expect(ctas.some((cta) => cta.href === '/pricing')).toBe(false);
  });
});
