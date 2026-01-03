import { describe, expect, it } from 'vitest';
import { evaluateNoticeCompliance } from '@/lib/notices/evaluate-notice-compliance';
import { normalizeFactKeys, getAffectedQuestionId, getFactValue } from '@/lib/wizard/normalizeFacts';

describe('notice-only inline validation (wizard stage)', () => {
  it('downgrades Section 21 deposit protection gaps to warnings during wizard', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        deposit_taken: true,
      },
      stage: 'wizard',
    });

    expect(result.hardFailures).toHaveLength(0);
    expect(result.warnings.find((w) => w.code === 'S21-DEPOSIT-NONCOMPLIANT')).toBeTruthy();
    const warning = result.warnings.find((w) => w.code === 'S21-DEPOSIT-NONCOMPLIANT');
    expect(warning?.affected_question_id).toBe('deposit_protected_scheme');
  });

  it('leaves Section 8 arrears path unblocked by deposit checks', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_8',
      wizardFacts: {
        deposit_taken: true,
        deposit_protected: false,
        section8_grounds: ['Ground 8'],
        notice_service: { notice_date: '2024-01-01' },
      },
      stage: 'wizard',
    });

    expect(result.hardFailures.find((f) => f.code.startsWith('S21-'))).toBeFalsy();
  });

  // ===========================================================================
  // REGRESSION TEST: Exact case from the bug report
  // section_21, deposit_taken=true, deposit_protected=false
  // Expected: wizard shows inline warning (not error), allows navigation
  // ===========================================================================
  it('regression: Section 21 with unprotected deposit shows warning at wizard stage, not hard failure', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        deposit_taken: true,
        deposit_protected: false,
        prescribed_info_given: false,
        gas_certificate_provided: false,
      },
      stage: 'wizard',
    });

    // At wizard stage: all compliance issues should be WARNINGS, not hard failures
    // This ensures the wizard NEVER blocks navigation
    expect(result.hardFailures).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);

    // Should include deposit protection warning with correct affected_question_id
    const depositWarning = result.warnings.find((w) => w.code === 'S21-DEPOSIT-NONCOMPLIANT');
    expect(depositWarning).toBeTruthy();
    expect(depositWarning?.affected_question_id).toBe('deposit_protected_scheme');
    expect(depositWarning?.user_fix_hint).toBeTruthy();
  });

  it('wizard stage never returns hard failures for Section 21 compliance checks', () => {
    // Even with multiple compliance issues, wizard stage should only return warnings
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        deposit_taken: true,
        deposit_protected: false,
        prescribed_info_given: false,
        how_to_rent_provided: false,
        gas_certificate_provided: false,
        has_gas_appliances: true,
        epc_provided: false,
        property_licensing_status: 'unlicensed',
      },
      stage: 'wizard',
    });

    // All should be warnings at wizard stage (navigation never blocked)
    expect(result.hardFailures).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);

    // Result should indicate "ok" because hardFailures is empty
    // (warnings don't block)
    expect(result.ok).toBe(true);
  });
});

describe('notice-only preview stage (hard stop)', () => {
  // ===========================================================================
  // REGRESSION TEST: Preview is the ONLY hard stop
  // Same data as wizard test but at preview stage => hard failures
  // ===========================================================================
  it('regression: Section 21 with unprotected deposit returns hard failure at preview stage', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        deposit_taken: true,
        deposit_protected: false,
        prescribed_info_given: false,
        gas_certificate_provided: false,
      },
      stage: 'preview',
    });

    // At preview stage: compliance issues ARE hard failures
    expect(result.ok).toBe(false);
    expect(result.hardFailures.length).toBeGreaterThan(0);

    // Should include deposit protection failure with correct affected_question_id
    const depositFailure = result.hardFailures.find((f) => f.code === 'S21-DEPOSIT-NONCOMPLIANT');
    expect(depositFailure).toBeTruthy();
    expect(depositFailure?.affected_question_id).toBe('deposit_protected_scheme');
    expect(depositFailure?.user_fix_hint).toBeTruthy();
    expect(depositFailure?.legal_reason).toBeTruthy();
  });

  it('preview stage returns structured validation data suitable for UI rendering', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        deposit_taken: true,
        deposit_protected: false,
        notice_service: { notice_date: '2025-01-15' },
        tenancy_start_date: '2024-01-01',
      },
      stage: 'preview',
    });

    // Every hard failure should have all fields needed for UI rendering
    for (const failure of result.hardFailures) {
      expect(failure.code).toBeTruthy();
      expect(failure.affected_question_id).toBeTruthy();
      expect(failure.legal_reason).toBeTruthy();
      expect(failure.user_fix_hint).toBeTruthy();
    }

    // Should also return computed dates even when noncompliant
    if (result.computed) {
      expect(typeof result.computed.expiry_date === 'string' || result.computed.expiry_date === undefined).toBe(true);
    }
  });
});

describe('canonical fact key normalization', () => {
  it('normalizes legacy gas safety certificate keys', () => {
    const facts = {
      gas_safety_cert_provided: true,
    };

    const normalized = normalizeFactKeys(facts);
    expect(normalized.gas_certificate_provided).toBe(true);
  });

  it('normalizes legacy how to rent keys', () => {
    const facts = {
      how_to_rent_given: true,
    };

    const normalized = normalizeFactKeys(facts);
    expect(normalized.how_to_rent_provided).toBe(true);
  });

  it('normalizes legacy prescribed info keys', () => {
    const facts = {
      prescribed_info_provided: true,
    };

    const normalized = normalizeFactKeys(facts);
    expect(normalized.prescribed_info_given).toBe(true);
  });

  it('normalizes nested notice service keys', () => {
    const facts = {
      notice_service: {
        notice_date: '2025-01-15',
        notice_expiry_date: '2025-03-15',
      },
    };

    const normalized = normalizeFactKeys(facts);
    expect(normalized.notice_service_date).toBe('2025-01-15');
    expect(normalized.notice_expiry_date).toBe('2025-03-15');
  });

  it('does not overwrite existing canonical keys', () => {
    const facts = {
      gas_certificate_provided: false,
      gas_safety_cert_provided: true, // Legacy key should not overwrite
    };

    const normalized = normalizeFactKeys(facts);
    expect(normalized.gas_certificate_provided).toBe(false); // Original value preserved
  });

  it('getAffectedQuestionId returns correct question ID for legacy keys', () => {
    expect(getAffectedQuestionId('gas_safety_cert_provided')).toBe('gas_safety_certificate');
    expect(getAffectedQuestionId('how_to_rent_given')).toBe('how_to_rent_provided');
  });

  it('getFactValue retrieves values through normalization', () => {
    const facts = {
      gas_safety_cert_provided: true, // Legacy key
    };

    // Should find the value even when asking for canonical key
    const value = getFactValue(facts, 'gas_certificate_provided');
    expect(value).toBe(true);
  });
});

describe('evaluate compliance uses normalized facts', () => {
  it('recognizes legacy gas_safety_cert_provided key for Section 21 validation', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        has_gas_appliances: true,
        gas_safety_cert_provided: true, // Legacy key
        deposit_taken: true,
        deposit_protected: true,
        prescribed_info_given: true,
        how_to_rent_provided: true,
        epc_provided: true,
        property_licensing_status: 'licensed',
        tenancy_start_date: '2024-01-01',
        notice_service: { notice_date: '2025-06-01' },
      },
      stage: 'preview',
    });

    // With legacy key normalized, there should be no gas certificate failure
    const gasFailure = result.hardFailures.find((f) => f.code === 'S21-GAS-CERT');
    expect(gasFailure).toBeFalsy();
  });

  it('recognizes legacy how_to_rent_given key for Section 21 validation', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        how_to_rent_given: true, // Legacy key
        deposit_taken: true,
        deposit_protected: true,
        prescribed_info_given: true,
        gas_certificate_provided: true,
        has_gas_appliances: true,
        epc_provided: true,
        property_licensing_status: 'licensed',
        tenancy_start_date: '2024-01-01',
        notice_service: { notice_date: '2025-06-01' },
      },
      stage: 'preview',
    });

    // With legacy key normalized, there should be no how to rent failure
    const h2rFailure = result.hardFailures.find((f) => f.code === 'S21-H2R');
    expect(h2rFailure).toBeFalsy();
  });
});
