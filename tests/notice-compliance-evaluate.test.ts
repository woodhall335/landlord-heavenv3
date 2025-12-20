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
});

