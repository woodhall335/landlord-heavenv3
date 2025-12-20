import { describe, expect, it } from 'vitest';
import { evaluateNoticeCompliance } from '@/lib/notices/evaluate-notice-compliance';

describe('notice-only compliance matrix', () => {
  it('passes Section 21 when all compliance items are satisfied', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        deposit_taken: true,
        deposit_protected: true,
        prescribed_info_given: true,
        epc_provided: true,
        how_to_rent_provided: true,
        has_gas_appliances: true,
        gas_certificate_provided: true,
        property_licensing_status: 'licensed',
        tenancy_start_date: '2023-01-01',
        notice_service: { notice_date: '2024-01-01' },
        notice_expiry_date: '2024-03-05',
      },
      stage: 'generate',
    });

    expect(result.ok).toBe(true);
    expect(result.hardFailures).toHaveLength(0);
  });

  it('warns inline but blocks on generate when prescribed information is unknown', () => {
    const warningStage = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        deposit_taken: true,
        deposit_protected: true,
      },
      stage: 'wizard',
    });

    expect(warningStage.hardFailures).toHaveLength(0);
    expect(warningStage.warnings.some((w) => w.affected_question_id === 'prescribed_info_given')).toBe(true);

    const generateStage = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        deposit_taken: true,
        deposit_protected: true,
        prescribed_info_given: false,
      },
      stage: 'generate',
    });

    expect(generateStage.hardFailures.some((f) => f.affected_question_id === 'prescribed_info_given')).toBe(true);
  });

  it('uses Wales rules instead of England for Welsh jurisdiction', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'wales',
      product: 'notice_only',
      selected_route: 'wales_section_173',
      wizardFacts: {
        rent_smart_wales_registered: false,
        contract_start_date: '2023-01-01',
        notice_service_date: '2024-01-01',
      },
      stage: 'generate',
    });

    expect(result.hardFailures.some((f) => f.code.startsWith('S173'))).toBe(true);
    expect(result.hardFailures.some((f) => f.code.startsWith('S21-'))).toBe(false);
  });

  it('routes Scotland to Notice to Leave compliance without S21 issues', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'scotland',
      product: 'notice_only',
      selected_route: 'notice_to_leave',
      wizardFacts: {
        scotland_ground_codes: [1],
        issues: { rent_arrears: { pre_action_confirmed: true } },
        notice: { notice_date: '2024-01-01' },
      },
      stage: 'generate',
    });

    expect(result.hardFailures.some((f) => f.code.startsWith('S21'))).toBe(false);
  });
});
