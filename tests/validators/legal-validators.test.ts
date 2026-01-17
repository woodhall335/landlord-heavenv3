import { describe, expect, it } from 'vitest';
import {
  validateSection21Notice,
  validateSection8Notice,
  validateWalesNotice,
  validateScotlandNoticeToLeave,
  validateTenancyAgreement,
  validateMoneyClaim,
} from '@/lib/validators/legal-validators';

describe('legal validators', () => {
  it('marks Section 21 as invalid when deposit protection is false', () => {
    const result = validateSection21Notice({
      jurisdiction: 'england',
      extracted: {
        notice_type: 'Form 6A',
        date_served: '2024-01-01',
        expiry_date: '2024-03-05',
        signature_present: true,
      },
      answers: {
        deposit_protected: 'no',
        prescribed_info_served: 'yes',
        gas_safety_pre_move_in: 'yes',
        epc_provided: 'yes',
        how_to_rent_provided: 'yes',
        property_licensed: 'yes',
      },
    });

    expect(result.status).toBe('invalid');
    expect(result.upsell?.product).toBe('complete_eviction_pack');
  });

  it('marks Section 21 as warning when required info is unknown', () => {
    const result = validateSection21Notice({
      jurisdiction: 'england',
      extracted: {
        notice_type: 'Section 21',
        date_served: '2024-01-01',
        expiry_date: '2024-03-05',
        signature_present: true,
      },
      answers: {
        deposit_protected: 'unknown',
        prescribed_info_served: 'yes',
        gas_safety_pre_move_in: 'yes',
        epc_provided: 'yes',
        how_to_rent_provided: 'yes',
        property_licensed: 'yes',
      },
    });

    expect(result.status).toBe('warning');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('marks Section 8 Ground 8 as satisfied when arrears meet threshold', () => {
    const result = validateSection8Notice({
      jurisdiction: 'england',
      extracted: {
        grounds_cited: ['Ground 8'],
      },
      answers: {
        rent_frequency: 'monthly',
        rent_amount: 1000,
        current_arrears: 2500,
        payment_history: 'no',
        joint_tenants: 'no',
      },
    });

    expect(result.status).toBe('ground_8_satisfied');
    expect(result.upsell?.product).toBe('complete_eviction_pack');
  });

  it('flags Wales notices as invalid when fitness issues are unresolved', () => {
    const result = validateWalesNotice({
      jurisdiction: 'wales',
      extracted: {
        bilingual_text_present: true,
      },
      answers: {
        written_statement_provided: 'yes',
        deposit_protected: 'yes',
        occupation_type_confirmed: 'yes',
        fitness_for_habitation: 'yes',
      },
    });

    expect(result.status).toBe('invalid');
  });

  it('marks Scotland Notice to Leave as insufficient evidence when evidence is unknown', () => {
    const result = validateScotlandNoticeToLeave({
      jurisdiction: 'scotland',
      extracted: {
        ground_cited: 'Ground 1',
      },
      answers: {
        ground_evidence: 'unknown',
        tribunal_served: 'yes',
        tenancy_length_confirmed: 'yes',
      },
    });

    expect(result.status).toBe('insufficient_evidence');
  });

  it('marks tenancy agreements as non-compliant when prohibited fees are present', () => {
    const result = validateTenancyAgreement({
      extracted: {},
      answers: {
        jurisdiction: 'england',
        intended_use: 'AST',
        prohibited_fees_present: 'yes',
      },
    });

    expect(result.status).toBe('non_compliant');
    expect(result.upsell?.product).toBe('premium_tenancy_agreement');
  });

  it('marks money claims as missing steps when pre-action steps are incomplete', () => {
    const result = validateMoneyClaim({
      extracted: {},
      answers: {
        pre_action_steps: 'no',
      },
    });

    expect(result.status).toBe('missing_steps');
    expect(result.upsell?.product).toBe('guidance_checklist');
  });
});
