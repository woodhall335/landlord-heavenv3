import { describe, expect, it } from 'vitest';

import { PRODUCTS } from '@/lib/pricing/products';
import { CLAIM_PACK_DISPLAY_PRICE, CLAIM_PACK_PRICE, CLAIM_TYPE_CONFIGS } from '../config';
import { CLAIM_STEP_IDS, getClaimHandoffHref, validateAllClaimConfigs } from '../validation';

describe('claim type configs', () => {
  it('defines the eight launch categories', () => {
    expect(CLAIM_TYPE_CONFIGS.map((config) => config.id)).toEqual([
      'landlord_debt_claim',
      'unpaid_invoice',
      'loan_or_money_owed',
      'faulty_goods_refund',
      'poor_service_contractor_dispute',
      'builder_tradesperson_dispute',
      'deposit_refund',
      'vehicle_repair_damage_dispute',
    ]);
  });

  it('uses the same six-step interview flow for every category', () => {
    for (const config of CLAIM_TYPE_CONFIGS) {
      expect(config.stepFlow.map((step) => step.stepId)).toEqual(CLAIM_STEP_IDS);
      expect(config.stepFlow[0].questions.map((question) => question.fieldPath)).toEqual(
        expect.arrayContaining(['claim_category', 'claim_flow_mode'])
      );
    }
  });

  it('collects every required document field and keeps at least ten keyword targets', () => {
    expect(validateAllClaimConfigs()).toEqual([]);
  });

  it('uses the unified money-claim price for every category', () => {
    expect(CLAIM_PACK_PRICE).toBe(PRODUCTS.money_claim.price);
    expect(CLAIM_PACK_DISPLAY_PRICE).toBe(PRODUCTS.money_claim.displayPrice);
    expect(CLAIM_TYPE_CONFIGS.map((config) => config.price)).toEqual(
      Array(CLAIM_TYPE_CONFIGS.length).fill(PRODUCTS.money_claim.price)
    );
  });

  it('keeps landlord claims on the existing money-claim generator route', () => {
    const landlordConfig = CLAIM_TYPE_CONFIGS.find((config) => config.id === 'landlord_debt_claim');

    expect(landlordConfig?.flowMode).toBe('landlord_money_claim');
    expect(getClaimHandoffHref(landlordConfig!)).toBe(
      '/wizard/flow?type=money_claim&product=money_claim&src=claims_app&topic=debt&claim_category=landlord_debt_claim'
    );
    expect(landlordConfig?.packOutputs.join(' ')).toContain('Current landlord Money Claim Pack');
  });

  it('keeps generic claim configs out of landlord-only flow mode and copy', () => {
    const genericConfigs = CLAIM_TYPE_CONFIGS.filter((config) => config.flowMode === 'generic_small_claim');

    expect(genericConfigs).toHaveLength(7);
    for (const config of genericConfigs) {
      expect(config.requiredDocumentFields).toEqual(
        expect.arrayContaining([
          'claimant.name',
          'claimant.address',
          'defendant.name',
          'defendant.address',
          'generic_claim.category',
          'generic_claim.summary',
          'generic_claim.key_dates',
          'generic_claim.line_items',
          'generic_claim.evidence_items',
          'generic_claim.pre_action',
          'generic_claim.interest',
        ])
      );
      expect(config.packOutputs.join(' ')).not.toMatch(/tenant|tenancy|rent arrears/i);
      expect(config.packOutputs).toContain('04-evidence-index.pdf');
    }
  });
});
