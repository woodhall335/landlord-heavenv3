import { describe, expect, it } from 'vitest';
import { evaluateNoticeCompliance } from '@/lib/notices/evaluate-notice-compliance';

describe('evaluateNoticeCompliance', () => {
  it('flags Section 21 deposit non-compliance as a hard failure', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        deposit_taken: true,
        deposit_protected: false,
        prescribed_info_given: false,
        tenancy_start_date: '2023-01-01',
        notice_service_date: '2024-01-10',
      },
      stage: 'generate',
    });

    expect(result.hardFailures.some((f) => f.code === 'S21-DEPOSIT-NONCOMPLIANT')).toBe(true);
    expect(result.ok).toBe(false);
  });

  it('warns (but does not hard fail) when prescribed info is unanswered', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        deposit_taken: true,
        deposit_protected: true,
        tenancy_start_date: '2023-01-01',
        notice_service_date: '2024-01-10',
      },
    });

    expect(result.hardFailures).toHaveLength(0);
    expect(result.warnings.some((w) => w.code === 'S21-PRESCRIBED-INFO-REQUIRED')).toBe(true);
    expect(result.ok).toBe(true);
  });

  it('blocks Section 8 when no grounds are selected', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_8',
      wizardFacts: {
        notice_service_date: '2024-02-01',
        tenancy_start_date: '2023-01-01',
      },
    });

    expect(result.hardFailures.find((f) => f.code === 'S8-GROUNDS-REQUIRED')).toBeTruthy();
  });

  it('rejects expiry dates earlier than the computed Section 21 minimum', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        deposit_taken: false,
        tenancy_start_date: '2023-01-01',
        notice_service_date: '2024-01-10',
        notice_expiry_date: '2024-02-01',
        rent_frequency: 'monthly',
      },
    });

    expect(result.hardFailures.find((f) => f.code === 'S21-DATE-TOO-SOON')).toBeTruthy();
  });

  it('validates Wales Section 173 route with canonical wales jurisdiction', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'wales',
      product: 'notice_only',
      selected_route: 'wales_section_173',
      wizardFacts: { rent_smart_wales_registered: false },
    });

    expect(result.hardFailures.find((f) => f.code === 'S173-LICENSING')).toBeTruthy();
  });

  it('hard blocks Wales Section 173 when notice period cannot be determined', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'wales',
      product: 'notice_only',
      selected_route: 'wales_section_173',
      wizardFacts: {
        rent_smart_wales_registered: true,
        language_choice: 'bilingual',
      },
    });

    expect(result.hardFailures.find((f) => f.code === 'S173-NOTICE-PERIOD-UNDETERMINED')).toBeTruthy();
  });

  it('requires pre-action confirmation for Scotland ground 1 rent arrears', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'scotland',
      product: 'notice_only',
      selected_route: 'notice_to_leave',
      wizardFacts: {
        scotland_ground_codes: [1],
        issues: { rent_arrears: { pre_action_confirmed: false } },
        notice_service_date: '2024-01-10',
      },
    });

    expect(result.hardFailures.find((f) => f.code === 'NTL-PRE-ACTION')).toBeTruthy();
  });

  it('does not raise pre-action failure when Scotland ground 1 steps are confirmed', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'scotland',
      product: 'notice_only',
      selected_route: 'notice_to_leave',
      wizardFacts: {
        scotland_ground_codes: [1],
        issues: { rent_arrears: { pre_action_confirmed: true } },
        notice_service_date: '2024-01-10',
        notice_expiry_date: '2024-02-10',
      },
    });

    expect(result.hardFailures.find((f) => f.code === 'NTL-PRE-ACTION')).toBeFalsy();
  });

  describe('deposit cap enforcement (Tenant Fees Act 2019)', () => {
    it('does not crash when deposit_amount and rent_amount are strings', () => {
      // This tests the type coercion fix - string inputs should be parsed correctly
      expect(() =>
        evaluateNoticeCompliance({
          jurisdiction: 'england',
          product: 'notice_only',
          selected_route: 'section_21',
          wizardFacts: {
            deposit_taken: true,
            deposit_amount: '2000',  // String, not number
            rent_amount: '1000',     // String, not number
            rent_frequency: 'monthly',
            deposit_protected: true,
            prescribed_info_given: true,
            tenancy_start_date: '2023-01-01',
            notice_service_date: '2024-06-01',
          },
          stage: 'wizard',
        })
      ).not.toThrow();
    });

    it('flags deposit cap exceeded when deposit exceeds legal maximum and not confirmed', () => {
      // Monthly rent 1000 = annual 12000. Max deposit = 5 weeks = 12000/52*5 = 1153.85
      // Deposit 2000 exceeds cap
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {
          deposit_taken: true,
          deposit_amount: 2000,
          rent_amount: 1000,
          rent_frequency: 'monthly',
          deposit_protected: true,
          prescribed_info_given: true,
          deposit_reduced_to_legal_cap_confirmed: 'no',
          tenancy_start_date: '2023-01-01',
          notice_service_date: '2024-06-01',
        },
        stage: 'wizard',
      });

      // Deposit cap exceeded is now a hard failure, not a warning
      const capIssue = result.hardFailures.find((f) => f.code === 'S21-DEPOSIT-CAP-EXCEEDED');
      expect(capIssue).toBeTruthy();
    });

    it('includes entered deposit and maximum allowed in the deposit cap message', () => {
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {
          deposit_taken: true,
          deposit_amount: 3000,
          rent_amount: 1000,
          rent_frequency: 'monthly',
          deposit_protected: true,
          prescribed_info_given: true,
          deposit_reduced_to_legal_cap_confirmed: 'no',
          tenancy_start_date: '2023-01-01',
          notice_service_date: '2024-06-01',
        },
        stage: 'wizard',
      });

      // Deposit cap exceeded is now a hard failure
      const capIssue = result.hardFailures.find((f) => f.code === 'S21-DEPOSIT-CAP-EXCEEDED');
      expect(capIssue).toBeTruthy();
      // Check the message includes "Entered deposit" and "Maximum allowed"
      expect(capIssue?.legal_reason).toContain('Entered deposit');
      expect(capIssue?.legal_reason).toContain('Maximum allowed');
      expect(capIssue?.legal_reason).toContain('3000.00');  // Entered amount
      expect(capIssue?.legal_reason).toContain('5 weeks');   // Cap explanation
    });

    it('does not flag deposit cap when deposit is within legal maximum', () => {
      // Monthly rent 1000 = annual 12000. Max deposit = 5 weeks = ~1153.85
      // Deposit 1000 is within cap
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {
          deposit_taken: true,
          deposit_amount: 1000,
          rent_amount: 1000,
          rent_frequency: 'monthly',
          deposit_protected: true,
          prescribed_info_given: true,
          tenancy_start_date: '2023-01-01',
          notice_service_date: '2024-06-01',
        },
        stage: 'wizard',
      });

      expect(result.hardFailures.find((f) => f.code === 'S21-DEPOSIT-CAP-EXCEEDED')).toBeFalsy();
    });

    it('does not flag deposit cap when confirmed as reduced', () => {
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {
          deposit_taken: true,
          deposit_amount: 2000,
          rent_amount: 1000,
          rent_frequency: 'monthly',
          deposit_protected: true,
          prescribed_info_given: true,
          deposit_reduced_to_legal_cap_confirmed: 'yes',  // Confirmed
          tenancy_start_date: '2023-01-01',
          notice_service_date: '2024-06-01',
        },
        stage: 'wizard',
      });

      expect(result.hardFailures.find((f) => f.code === 'S21-DEPOSIT-CAP-EXCEEDED')).toBeFalsy();
    });

    it('uses 6 weeks cap when annual rent exceeds 50000', () => {
      // Monthly rent 5000 = annual 60000 > 50000, so max is 6 weeks
      // 6 weeks rent = 60000/52*6 = ~6923.08
      // Deposit 6500 is within 6-week cap
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {
          deposit_taken: true,
          deposit_amount: 6500,
          rent_amount: 5000,
          rent_frequency: 'monthly',
          deposit_protected: true,
          prescribed_info_given: true,
          tenancy_start_date: '2023-01-01',
          notice_service_date: '2024-06-01',
        },
        stage: 'wizard',
      });

      // Should not trigger cap exceeded (6500 < 6923.08)
      expect(result.hardFailures.find((f) => f.code === 'S21-DEPOSIT-CAP-EXCEEDED')).toBeFalsy();
    });

    it('handles string inputs for deposit and rent amounts', () => {
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {
          deposit_taken: true,
          deposit_amount: '2000',  // String
          rent_amount: '1000',     // String
          rent_frequency: 'monthly',
          deposit_protected: true,
          prescribed_info_given: true,
          deposit_reduced_to_legal_cap_confirmed: 'no',
          tenancy_start_date: '2023-01-01',
          notice_service_date: '2024-06-01',
        },
        stage: 'wizard',
      });

      // Should correctly detect cap exceeded even with string inputs (now a hard failure)
      const capIssue = result.hardFailures.find((f) => f.code === 'S21-DEPOSIT-CAP-EXCEEDED');
      expect(capIssue).toBeTruthy();
    });
  });
});

