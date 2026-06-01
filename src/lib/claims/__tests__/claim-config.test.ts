import { describe, expect, it } from 'vitest';

import { PRODUCTS } from '@/lib/pricing/products';
import { CLAIM_PACK_DISPLAY_PRICE, CLAIM_PACK_PRICE, CLAIM_TYPE_CONFIGS } from '../config';
import { getGenericClaimLegalRules } from '../legal-rules';
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

  it('keeps landlord claims inside the claims app while using the landlord document model', () => {
    const landlordConfig = CLAIM_TYPE_CONFIGS.find((config) => config.id === 'landlord_debt_claim');

    expect(landlordConfig?.flowMode).toBe('landlord_money_claim');
    expect(getClaimHandoffHref(landlordConfig!)).toBe('/claims?claim=landlord-debt-claim');
    expect(landlordConfig?.packOutputs.join(' ')).toContain('Landlord debt claim pack');
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
          'generic_claim.line_items',
          'generic_claim.evidence_items',
          'generic_claim.pre_action',
          'generic_claim.interest',
        ])
      );
      expect(config.packOutputs.join(' ')).not.toMatch(/tenant|tenancy|rent arrears/i);
      expect(config.packOutputs).toContain('04-evidence-index.pdf');
      expect(config.packOutputs).toContain('10-n1-claim-form.pdf official N1 form');
      expect(getGenericClaimLegalRules(config.id)?.official_forms).toContain('N1 claim form');
      expect(getGenericClaimLegalRules(config.id)?.required_elements.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('asks fuller pack-generation questions for generic and landlord claim outputs', () => {
    const genericConfig = CLAIM_TYPE_CONFIGS.find((config) => config.id === 'unpaid_invoice')!;
    const genericFields = genericConfig.stepFlow.flatMap((step) => step.questions.map((question) => question.fieldPath));

    expect(genericFields).toEqual(
      expect.arrayContaining([
        'claimant.email',
        'claimant.phone',
        'defendant.email',
        'generic_claim.key_dates.pre_action_sent_date',
        'generic_claim.key_dates.response_deadline',
        'generic_claim.key_dates.interest_start_date',
        'generic_claim.preferred_filing_route',
      ])
    );

    const landlordConfig = CLAIM_TYPE_CONFIGS.find((config) => config.id === 'landlord_debt_claim')!;
    const landlordFields = landlordConfig.stepFlow.flatMap((step) => step.questions.map((question) => question.fieldPath));

    expect(landlordFields).toEqual(
      expect.arrayContaining([
        'landlord_address_line1',
        'landlord_address_postcode',
        'defendant_address_line1',
        'defendant_address_postcode',
        'property_address_postcode',
        'rent_due_day',
        'money_claim.attempts_to_resolve',
        'money_claim.interest_start_date',
      ])
    );
  });
});
