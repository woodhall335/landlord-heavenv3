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
  it('keeps general money-claim links owner-first, then unpaid-rent support, then process guidance, then product', () => {
    expect(moneyClaimRelatedLinks.slice(0, 5).map((link) => link.href)).toEqual([
      '/money-claim',
      '/money-claim-unpaid-rent',
      '/money-claim-letter-before-action',
      '/money-claim-online-mcol',
      '/products/money-claim',
    ]);
  });

  it('keeps hub links owner-first and pushes the product after scenario and process guidance', () => {
    expect(moneyClaimHubLinks.slice(0, 7).map((link) => link.href)).toEqual([
      '/money-claim',
      '/money-claim-unpaid-rent',
      '/money-claim-unpaid-bills',
      '/money-claim-property-damage',
      '/money-claim-cleaning-costs',
      '/money-claim-online-mcol',
      '/products/money-claim',
    ]);
  });

  it('keeps rent-focused links owner-first with unpaid-rent as the strongest support route', () => {
    expect(moneyClaimRentLinks.slice(0, 6).map((link) => link.href)).toEqual([
      '/money-claim',
      '/money-claim-unpaid-rent',
      '/money-claim-former-tenant',
      '/money-claim-guarantor',
      '/tools/rent-arrears-calculator',
      '/products/money-claim',
    ]);
  });

  it('keeps utilities-focused links owner-first and product downstream', () => {
    expect(moneyClaimUtilitiesLinks.slice(0, 5).map((link) => link.href)).toEqual([
      '/money-claim',
      '/money-claim-unpaid-bills',
      '/money-claim-unpaid-utilities',
      '/money-claim-former-tenant',
      '/products/money-claim',
    ]);
  });

  it('keeps process and form links owner-first with product last', () => {
    expect(moneyClaimProcessLinks.slice(0, 6).map((link) => link.href)).toEqual([
      '/money-claim',
      '/money-claim-online-mcol',
      '/money-claim-n1-claim-form',
      '/money-claim-letter-before-action',
      '/money-claim-ccj-enforcement',
      '/products/money-claim',
    ]);

    expect(moneyClaimFormLinks.slice(0, 6).map((link) => link.href)).toEqual([
      '/money-claim',
      '/money-claim-letter-before-action',
      '/money-claim-schedule-of-debt',
      '/money-claim-n1-claim-form',
      '/money-claim-online-mcol',
      '/products/money-claim',
    ]);
  });

  it('keeps enforcement links owner-first with product downstream', () => {
    expect(moneyClaimEnforcementLinks.slice(0, 4).map((link) => link.href)).toEqual([
      '/money-claim',
      '/money-claim-ccj-enforcement',
      '/money-claim-former-tenant',
      '/products/money-claim',
    ]);
  });
});
