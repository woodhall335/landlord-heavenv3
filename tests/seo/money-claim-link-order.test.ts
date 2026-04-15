import { describe, expect, it } from 'vitest';
import {
  moneyClaimRelatedLinks,
  moneyClaimHubLinks,
  moneyClaimRentLinks,
  moneyClaimUtilitiesLinks,
  moneyClaimProcessLinks,
  moneyClaimFormLinks,
  moneyClaimEnforcementLinks,
} from '@/lib/seo/internal-links';

describe('money claim link ordering', () => {
  it('keeps general money-claim links anchored on the commercial owner, then unpaid-rent support, then process guidance', () => {
    expect(moneyClaimRelatedLinks.slice(0, 5).map((link) => link.href)).toEqual([
      '/products/money-claim',
      '/money-claim-unpaid-rent',
      '/money-claim-letter-before-action',
      '/money-claim-online-mcol',
      '/tools/rent-arrears-calculator',
    ]);
  });

  it('keeps hub links owner-first without duplicating the commercial owner later in the list', () => {
    expect(moneyClaimHubLinks.slice(0, 7).map((link) => link.href)).toEqual([
      '/products/money-claim',
      '/money-claim-unpaid-rent',
      '/money-claim-unpaid-bills',
      '/money-claim-property-damage',
      '/money-claim-cleaning-costs',
      '/money-claim-online-mcol',
      '/money-claim-unpaid-utilities',
    ]);
  });

  it('keeps rent-focused links owner-first with unpaid-rent as the strongest support route', () => {
    expect(moneyClaimRentLinks.slice(0, 6).map((link) => link.href)).toEqual([
      '/products/money-claim',
      '/money-claim-unpaid-rent',
      '/money-claim-former-tenant',
      '/money-claim-guarantor',
      '/tools/rent-arrears-calculator',
      '/money-claim-early-termination',
    ]);
  });

  it('keeps utilities-focused links owner-first and rolls forward into the supporting debt scenarios', () => {
    expect(moneyClaimUtilitiesLinks.slice(0, 5).map((link) => link.href)).toEqual([
      '/products/money-claim',
      '/money-claim-unpaid-bills',
      '/money-claim-unpaid-utilities',
      '/money-claim-former-tenant',
      '/money-claim-council-tax',
    ]);
  });

  it('keeps process and form links owner-first with the supporting court steps following behind', () => {
    expect(moneyClaimProcessLinks.slice(0, 6).map((link) => link.href)).toEqual([
      '/products/money-claim',
      '/money-claim-online-mcol',
      '/money-claim-n1-claim-form',
      '/money-claim-letter-before-action',
      '/money-claim-ccj-enforcement',
      '/money-claim-small-claims-landlord',
    ]);

    expect(moneyClaimFormLinks.slice(0, 6).map((link) => link.href)).toEqual([
      '/products/money-claim',
      '/money-claim-letter-before-action',
      '/money-claim-schedule-of-debt',
      '/money-claim-n1-claim-form',
      '/money-claim-online-mcol',
      '/money-claim-pap-financial-statement',
    ]);
  });

  it('keeps enforcement links owner-first and then moves into the enforcement explainer content', () => {
    expect(moneyClaimEnforcementLinks.slice(0, 4).map((link) => link.href)).toEqual([
      '/products/money-claim',
      '/money-claim-ccj-enforcement',
      '/money-claim-former-tenant',
      '/blog/what-is-county-court-judgment-landlords',
    ]);
  });
});
