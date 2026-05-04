import { buildEnglandSection8CompletePackFacts } from '@/lib/testing/fixtures/complete-pack';

export type Section8CourtPackQaPackType = 'notice_only' | 'complete_pack';

export interface Section8CourtPackQaScenario {
  key: string;
  displayName: string;
  packType: Section8CourtPackQaPackType;
  facts: Record<string, any>;
}

function buildArrearsItems(periodStarts: string[], amountOwed: number): Array<Record<string, any>> {
  return periodStarts.map((periodStart) => {
    const start = new Date(`${periodStart}T00:00:00`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const periodEnd = end.toISOString().slice(0, 10);

    return {
      period_start: periodStart,
      period_end: periodEnd,
      rent_due: amountOwed,
      rent_paid: 0,
      amount_owed: amountOwed,
    };
  });
}

function buildBaseFacts(params: {
  caseId: string;
  noticeServedDate: string;
  noticeServiceMethod: string;
  noticeServiceTime?: string;
  totalArrears: number;
  arrearsItems: Array<Record<string, any>>;
  courtMode?: boolean;
}): Record<string, any> {
  const base = buildEnglandSection8CompletePackFacts({
    overrides: {
      __meta: { case_id: params.caseId, jurisdiction: 'england' },
      current_date: '2026-03-10',
      clean_output: true,
      court_mode: params.courtMode ?? true,
      landlord_name: 'Daniel Mercer',
      landlord_address_line1: '27 Rowan Avenue',
      landlord_city: 'Leeds',
      landlord_postcode: 'LS8 2PF',
      landlord_email: 'daniel.mercer@example.com',
      landlord_phone: '07123 456789',
      tenant1_name: 'Ivy Carleton',
      tenant1_email: 'ivy.carleton@example.com',
      tenant1_phone: '07999 000001',
      property_address_line1: '16 Willow Mews',
      property_city: 'York',
      property_postcode: 'YO24 3HX',
      tenancy_start_date: '2024-06-01',
      tenancy_type: 'assured_tenancy',
      court_name: 'York County Court and Family Court',
      rent_amount: 1200,
      rent_frequency: 'monthly',
      rent_due_day: 1,
      section8_grounds: ['Ground 8', 'Ground 10'],
      ground_numbers: '8,10',
      notice_type: 'Section 8',
      selected_notice_route: 'section_8',
      recommended_route: 'section_8',
      eviction_route: 'section_8',
      notice_date: params.noticeServedDate,
      notice_served_date: params.noticeServedDate,
      notice_service_date: params.noticeServedDate,
      section_8_notice_date: params.noticeServedDate,
      notice_service_method: params.noticeServiceMethod,
      service_method: params.noticeServiceMethod,
      notice_service_time: params.noticeServiceTime,
      service_time: params.noticeServiceTime,
      total_arrears: params.totalArrears,
      rent_arrears_amount: params.totalArrears,
      arrears_items: params.arrearsItems,
      defendant_circumstances:
        'The defendant has acknowledged the arrears but has not offered a sustainable repayment plan.',
      signing_date: '2026-03-10',
      signature_date: '2026-03-10',
      signatory_name: 'Daniel Mercer',
      arrears_breakdown: `Total arrears £${params.totalArrears.toFixed(2)}`,
      case_facts: {
        eviction: {
          notice_served_date: params.noticeServedDate,
          rent_arrears_amount: params.totalArrears,
        },
      },
    },
  });

  return base;
}

export function buildSection8CourtPackQaScenarios(): Section8CourtPackQaScenario[] {
  return [
    {
      key: 'notice_only_first_class_post_above_threshold',
      displayName: 'Section 8 Notice Only QA - First Class Post - Above Threshold',
      packType: 'notice_only',
      facts: buildBaseFacts({
        caseId: 'qa-notice-only-post-001',
        noticeServedDate: '2026-03-04',
        noticeServiceMethod: 'first_class_post',
        totalArrears: 4800,
        arrearsItems: buildArrearsItems(
          ['2025-12-01', '2026-01-01', '2026-02-01', '2026-03-01'],
          1200,
        ),
        courtMode: false,
      }),
    },
    {
      key: 'notice_only_personal_after_cutoff_at_threshold',
      displayName: 'Section 8 Notice Only QA - Personal After Cutoff - At Threshold',
      packType: 'notice_only',
      facts: buildBaseFacts({
        caseId: 'qa-notice-only-personal-001',
        noticeServedDate: '2026-03-05',
        noticeServiceMethod: 'personal',
        noticeServiceTime: '17:15',
        totalArrears: 3600,
        arrearsItems: buildArrearsItems(['2025-12-01', '2026-01-01', '2026-02-01'], 1200),
        courtMode: false,
      }),
    },
    {
      key: 'complete_pack_first_class_post_above_threshold',
      displayName: 'Section 8 Complete Pack QA - First Class Post - Above Threshold',
      packType: 'complete_pack',
      facts: buildBaseFacts({
        caseId: 'qa-complete-post-001',
        noticeServedDate: '2026-03-04',
        noticeServiceMethod: 'first_class_post',
        totalArrears: 4800,
        arrearsItems: buildArrearsItems(
          ['2025-12-01', '2026-01-01', '2026-02-01', '2026-03-01'],
          1200,
        ),
      }),
    },
    {
      key: 'complete_pack_electronic_after_cutoff_above_threshold',
      displayName: 'Section 8 Complete Pack QA - Electronic After Cutoff - Above Threshold',
      packType: 'complete_pack',
      facts: buildBaseFacts({
        caseId: 'qa-complete-electronic-001',
        noticeServedDate: '2026-03-06',
        noticeServiceMethod: 'other_electronic',
        noticeServiceTime: '18:05',
        totalArrears: 4800,
        arrearsItems: buildArrearsItems(
          ['2025-12-01', '2026-01-01', '2026-02-01', '2026-03-01'],
          1200,
        ),
      }),
    },
  ];
}
