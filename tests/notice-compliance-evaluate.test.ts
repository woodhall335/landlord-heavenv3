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

  it('normalises Wales route even when jurisdiction is england-wales', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england-wales',
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
});

