import { describe, expect, it, vi } from 'vitest';
import {
  evaluateSection21Precheck,
  getSection21PrecheckCompleteness,
  SECTION21_PRECHECK_DEFAULT_INPUT,
  Section21BlockerReasonCode,
  Section21WarningReasonCode,
  addCalendarMonths,
} from './section21Precheck';

const mockBank = {
  'england-and-wales': { events: [{ date: '2026-01-01', title: 'New Year' }] },
};

describe('section21Precheck', () => {
  it('completeness flags unsure and conditional missing fields', () => {
    const completeness = getSection21PrecheckCompleteness({
      ...SECTION21_PRECHECK_DEFAULT_INPUT,
      tenancy_start_date: '2025-01-01',
      is_replacement_tenancy: 'yes',
      tenancy_type: 'periodic',
      rent_period: 'monthly',
      planned_service_date: '2026-02-02',
      service_method: 'email',
      service_before_430pm: 'yes',
      tenant_consented_email_service: 'no',
      deposit_taken: 'yes',
      epc_required: 'yes',
      gas_installed: 'yes',
      landlord_type: 'private_landlord',
      property_requires_hmo_licence: 'no',
      property_requires_selective_licence: 'no',
      improvement_notice_served: 'no',
      emergency_remedial_action_served: 'no',
      prohibited_payment_outstanding: 'no',
      has_proof_of_service_plan: 'yes',
    });

    expect(completeness.complete).toBe(false);
    expect(completeness.missingLabels).toContain('Original tenancy start date');
    expect(completeness.missingLabels).toContain('Deposit received date');
    expect(completeness.missingLabels).toContain('Tenant consent to email service');
  });

  it('returns incomplete when inputs are not complete even if blockers exist', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ json: async () => mockBank })));
    const result = await evaluateSection21Precheck({
      ...SECTION21_PRECHECK_DEFAULT_INPUT,
      tenancy_start_date: '2025-01-01',
      is_replacement_tenancy: 'no',
      tenancy_type: 'periodic',
      rent_period: 'monthly',
      planned_service_date: '2026-05-01',
      service_method: 'hand',
      service_before_430pm: 'yes',
      deposit_taken: 'no',
      epc_required: 'no',
      gas_installed: 'no',
      landlord_type: 'unsure',
      property_requires_hmo_licence: 'no',
      property_requires_selective_licence: 'no',
      improvement_notice_served: 'no',
      emergency_remedial_action_served: 'no',
      prohibited_payment_outstanding: 'no',
      has_proof_of_service_plan: 'yes',
    });

    expect(result.status).toBe('incomplete');
    expect(result.missing_labels).toContain('Landlord type');
    expect(result.blockers.some((b) => b.code === Section21BlockerReasonCode.B001_PLANNED_SERVICE_ON_AFTER_MAY_2026)).toBe(true);
  });

  it('returns valid status with computed dates for compliant baseline', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ json: async () => mockBank })));
    const result = await evaluateSection21Precheck({
      ...SECTION21_PRECHECK_DEFAULT_INPUT,
      landlord_type: 'private_landlord',
      tenancy_start_date: '2025-01-01',
      is_replacement_tenancy: 'no',
      tenancy_type: 'periodic',
      rent_period: 'monthly',
      planned_service_date: '2026-02-02',
      service_method: 'first_class_post',
      service_before_430pm: 'yes',
      tenant_consented_email_service: 'yes',
      deposit_taken: 'no',
      epc_required: 'yes',
      epc_served_date: '2025-01-01',
      gas_installed: 'no',
      how_to_rent_served_date: '2025-01-01',
      how_to_rent_served_method: 'hardcopy',
      how_to_rent_was_current_version_at_tenancy_start: 'yes',
      property_requires_hmo_licence: 'no',
      property_requires_selective_licence: 'no',
      improvement_notice_served: 'no',
      emergency_remedial_action_served: 'no',
      prohibited_payment_outstanding: 'no',
      has_proof_of_service_plan: 'yes',
    });

    expect(result.status).toBe('valid');
    expect(result.deemed_service_date).toBe('2026-02-04');
    expect(result.earliest_after_date).toBe('2026-04-04');
    expect(result.latest_court_start_date).toBe('2026-07-31');
  });

  it('returns risky with exact blocker message for May 2026 transition once complete', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ json: async () => mockBank })));
    const result = await evaluateSection21Precheck({
      ...SECTION21_PRECHECK_DEFAULT_INPUT,
      tenancy_start_date: '2025-01-01',
      is_replacement_tenancy: 'no',
      tenancy_type: 'periodic',
      rent_period: 'monthly',
      planned_service_date: '2026-05-01',
      service_method: 'hand',
      service_before_430pm: 'yes',
      deposit_taken: 'no',
      epc_required: 'no',
      gas_installed: 'no',
      landlord_type: 'social_provider',
      property_requires_hmo_licence: 'no',
      property_requires_selective_licence: 'no',
      improvement_notice_served: 'no',
      emergency_remedial_action_served: 'no',
      prohibited_payment_outstanding: 'no',
      has_proof_of_service_plan: 'yes',
    });

    expect(result.status).toBe('risky');
    const blocker = result.blockers.find((b) => b.code === Section21BlockerReasonCode.B001_PLANNED_SERVICE_ON_AFTER_MAY_2026);
    expect(blocker?.message).toBe('Planned service date is on or after 1 May 2026. Section 21 cannot usually be used after this date in England.');
  });

  it('warns on weak proof of service and clamps end-of-month addCalendarMonths', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    const result = await evaluateSection21Precheck({
      ...SECTION21_PRECHECK_DEFAULT_INPUT,
      tenancy_start_date: '2025-01-31',
      is_replacement_tenancy: 'no',
      tenancy_type: 'periodic',
      rent_period: 'monthly',
      planned_service_date: '2026-02-27',
      service_method: 'hand',
      service_before_430pm: 'no',
      deposit_taken: 'no',
      epc_required: 'no',
      gas_installed: 'no',
      landlord_type: 'social_provider',
      property_requires_hmo_licence: 'no',
      property_requires_selective_licence: 'no',
      improvement_notice_served: 'no',
      emergency_remedial_action_served: 'no',
      prohibited_payment_outstanding: 'no',
      has_proof_of_service_plan: 'no',
    });

    const warning = result.warnings.find((w) => w.code === Section21WarningReasonCode.W004_PROOF_OF_SERVICE_WEAK);
    expect(warning?.message).toBe('You have not confirmed a clear proof-of-service plan. Keep evidence (photos, posting receipt, witness statement/N215).');
    const clamped = addCalendarMonths('2026-01-31', 1);
    expect(clamped.toISOString().slice(0, 10)).toBe('2026-02-28');
  });
});
